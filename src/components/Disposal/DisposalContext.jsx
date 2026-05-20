import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchOperatorPickups,
  fetchOperatorStats,
  fetchOperatorEarnings,
  acceptPickup,
  declinePickup,
} from '../../services/api';

const DisposalContext = createContext(null);

export const DisposalProvider = ({ children }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [stats, setStats] = useState({
    incomingCount: 0,
    scheduledCount: 0,
    tonnesProcessed: 0,
    revenue: 0,
    completedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [serviceListings, setServiceListings] = useState([]);
  const [companyProfile, setCompanyProfile] = useState({
    name: '', email: '', phone: '', location: '', licenses: '', about: '', initials: ''
  });

  // ── Normalize pickup from backend ──
  const normalize = (p) => {
    const rawName = p.user?.full_name;
    const institutionName = p.user?.generator_profile?.institution_name;

    const fullName =
      rawName && rawName !== 'string' && rawName !== ''
        ? rawName
        : institutionName && institutionName !== 'string' && institutionName !== ''
          ? institutionName
          : `Generator #${p.user_id}`;

    const initials = fullName
      .trim()
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return {
      id: p.transaction_id || `#${p.id}`,
      rawId: p.id,
      generator: fullName,
      email: p.user?.email && p.user.email !== 'string' ? p.user.email : '',
      phone: p.user?.generator_profile?.phone_number || '',
      wasteType: p.waste_type,
      weight: p.weight_kg ? `${p.weight_kg} kg` : '—',
      weightNum: p.weight_kg || 0,
      date: p.scheduled_time
        ? p.scheduled_time
        : new Date(p.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
      avatar: initials,
      location:
        p.user?.generator_profile?.street_address ||
        p.user?.generator_profile?.city ||
        '—',
      status: p.status,
      cost: p.cost || '—',
      notes: p.operator_notes || '',
      completedDate: p.updated_at
        ? new Date(p.updated_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })
        : null,
      acceptedAt: p.updated_at
        ? new Date(p.updated_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : null,
      declinedAt: p.updated_at
        ? new Date(p.updated_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : null,
      certificateIssued: !!p.certificate_file,
      createdAt: p.created_at,
    };
  };

  // ── Load all data from backend ──
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [all, statsData, earnings] = await Promise.all([
        fetchOperatorPickups(),
        fetchOperatorStats(),
        fetchOperatorEarnings(),
      ]);

      setIncomingRequests(
        all.filter(p => p.status === 'Pending').map(normalize)
      );
      setAcceptedRequests(
        all.filter(p => p.status === 'Confirmed').map(normalize)
      );
      setDeclinedRequests(
        all.filter(p => p.status === 'Cancelled').map(normalize)
      );
      setCompletedRequests(
        all.filter(p => p.status === 'Completed').map(normalize)
      );
      setStats(statsData);
      setEarningsData(earnings);
    } catch (err) {
      console.error('DisposalContext load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Today's route = confirmed pickups ──
  const todaysRoute = acceptedRequests.map((req) => ({
    id: req.rawId,
    generator: req.generator,
    address: req.location,
    time: req.date,
    wasteType: req.wasteType,
    status: 'Upcoming',
  }));

  // ── Actions ──
  const acceptRequest = useCallback(async (requestId) => {
    try {
      const raw = incomingRequests.find(
        r => r.id === requestId || r.rawId === requestId
      );
      const id = raw?.rawId || requestId;
      await acceptPickup(id);
      await loadAll();
    } catch (err) {
      console.error('Accept failed:', err);
    }
  }, [incomingRequests, loadAll]);

  const declineRequest = useCallback(async (requestId) => {
    try {
      const raw = incomingRequests.find(
        r => r.id === requestId || r.rawId === requestId
      );
      const id = raw?.rawId || requestId;
      await declinePickup(id);
      await loadAll();
    } catch (err) {
      console.error('Decline failed:', err);
    }
  }, [incomingRequests, loadAll]);

  const addListing = useCallback((listing) => {
    setServiceListings(prev => [{
      id: `LST-${Date.now()}`,
      ...listing,
      status: 'Active',
      createdAt: new Date().toLocaleDateString(),
    }, ...prev]);
  }, []);

  const toggleListingStatus = useCallback((id) => {
    setServiceListings(prev =>
      prev.map(l =>
        l.id === id ? { ...l, status: l.status === 'Active' ? 'Paused' : 'Active' } : l
      )
    );
  }, []);

  const deleteListing = useCallback((id) => {
    setServiceListings(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateProfile = useCallback((data) => {
    setCompanyProfile(prev => ({ ...prev, ...data }));
  }, []);

  const issueCertificate = useCallback((requestId) => {
    setCompletedRequests(prev =>
      prev.map(r =>
        r.id === requestId ? { ...r, certificateIssued: true } : r
      )
    );
  }, []);

  // ── Context value ──
  const value = {
    incomingRequests,
    acceptedRequests,
    declinedRequests,
    completedRequests,
    todaysRoute,
    earningsData,
    stats,
    loading,
    acceptRequest,
    declineRequest,
    serviceListings,
    addListing,
    toggleListingStatus,
    deleteListing,
    companyProfile,
    updateProfile,
    issueCertificate,
    refresh: loadAll,
  };

  return (
    <DisposalContext.Provider value={value}>
      {children}
    </DisposalContext.Provider>
  );
};

export const useDisposal = () => {
  const ctx = useContext(DisposalContext);
  if (!ctx) throw new Error('useDisposal must be used inside <DisposalProvider>');
  return ctx;
};

export default DisposalContext;