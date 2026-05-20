import { createContext, useContext, useState, useCallback, useRef } from 'react';

/* ──────────────────────────────────────────────
   Single Source of Truth for the Disposal module.
   Holds: serviceListings, pickupRequests (all tabs),
   confirmedSchedule (todaysRoute), and computed stats.
   ────────────────────────────────────────────── */

const DisposalContext = createContext(null);

/* ── Initial Service Listings ── */
const INITIAL_LISTINGS = [
  { id: 'LST-001', name: 'Organic Composting Service', method: 'Composting', wasteTypes: ['Cooked Food', 'Raw Scraps'], capacity: '500 kg/day', pricing: '₨ 8/kg', coverage: 'Lahore, Multan', status: 'Active', createdAt: 'Apr 10, 2026' },
  { id: 'LST-002', name: 'Biogas Conversion Plant', method: 'Biogas', wasteTypes: ['Expired Stock', 'Raw Scraps'], capacity: '1,000 kg/day', pricing: 'Pays you ₨ 3/kg', coverage: 'Lahore', status: 'Active', createdAt: 'Mar 22, 2026' },
  { id: 'LST-003', name: 'Animal Feed Processing', method: 'Animal Feed', wasteTypes: ['Cooked Food', 'Expired Stock'], capacity: '300 kg/day', pricing: '₨ 5/kg', coverage: 'Faisalabad, Lahore', status: 'Paused', createdAt: 'Feb 15, 2026' },
];

/* ── Initial Pickup Requests ── */
const INITIAL_INCOMING = [
  { id: 'REQ-1041', generator: 'Green Bites Restaurant', wasteType: 'Cooked Food', weight: '120 kg', weightNum: 120, date: 'Today, 2:00 PM', avatar: 'GB', location: '123 Food Street, Gulberg III' },
  { id: 'REQ-1042', generator: 'Pearl Continental Hotel', wasteType: 'Expired Stock', weight: '340 kg', weightNum: 340, date: 'Today, 4:30 PM', avatar: 'PC', location: '45 Mall Road, Lahore' },
  { id: 'REQ-1043', generator: 'LUMS University Cafeteria', wasteType: 'Raw Scraps', weight: '85 kg', weightNum: 85, date: 'Tomorrow, 9:00 AM', avatar: 'LU', location: 'DHA, Lahore Cantt' },
  { id: 'REQ-1044', generator: 'Sapphire Mall Food Court', wasteType: 'Cooked Food', weight: '200 kg', weightNum: 200, date: 'Tomorrow, 11:00 AM', avatar: 'SM', location: 'Sapphire Mall, Gulberg' },
  { id: 'REQ-1045', generator: 'Bundu Khan Restaurant', wasteType: 'Raw Scraps', weight: '150 kg', weightNum: 150, date: 'Tomorrow, 3:00 PM', avatar: 'BK', location: 'Liberty Market, Lahore' },
];

/* ── Confirmed Schedule / Today's Route ── */
const INITIAL_ROUTE = [
  { id: 'RT-001', generator: 'Green Bites Restaurant', address: '123 Food Street, Gulberg III', time: '10:00 AM', wasteType: 'Cooked Food', status: 'In Progress' },
  { id: 'RT-002', generator: 'Nishat Hotel', address: '45 Mall Road, Lahore', time: '11:30 AM', wasteType: 'Raw Scraps', status: 'Upcoming' },
  { id: 'RT-003', generator: 'FC College Cafeteria', address: 'Feroz Pur Road, Lahore', time: '1:00 PM', wasteType: 'Expired Stock', status: 'Upcoming' },
  { id: 'RT-004', generator: 'Metro Supermarket', address: 'DHA Phase 5, Lahore', time: '3:00 PM', wasteType: 'Packaging-Contaminated', status: 'Upcoming' },
];

const INITIAL_COMPLETED = [
  { id: 'REQ-0990', generator: 'Haveli Restaurant', wasteType: 'Cooked Food', weight: '90 kg', weightNum: 90, date: 'Apr 28, 2026', avatar: 'HR', location: 'Old City, Lahore', completedDate: 'Apr 28, 2026', certificateIssued: false },
  { id: 'REQ-0985', generator: 'Lahore Grammar School', wasteType: 'Raw Scraps', weight: '60 kg', weightNum: 60, date: 'Apr 27, 2026', avatar: 'LG', location: 'Johar Town, Lahore', completedDate: 'Apr 27, 2026', certificateIssued: false },
];

/* ── Initial Company Profile ── */
const INITIAL_PROFILE = {
  name: 'EcoCycle Lahore',
  email: 'contact@ecocycle.pk',
  phone: '+92 300 1234567',
  location: 'Gulberg III, Lahore',
  licenses: 'EPA Punjab, PSQCA',
  about: 'Leading organic waste management company in Lahore.',
  initials: 'EL'
};

/* ── Initial Earnings ── */
const INITIAL_EARNINGS = [
  { id: 'TRX-101', date: 'Apr 25, 2026', description: 'Monthly Retainer - PC Hotel', amount: 45000, status: 'Paid' },
  { id: 'TRX-102', date: 'Apr 26, 2026', description: 'Pickup Fee - LUMS', amount: 12000, status: 'Paid' },
  { id: 'TRX-103', date: 'Apr 28, 2026', description: 'Compost Sale - Local Farm', amount: 29400, status: 'Paid' },
  { id: 'TRX-104', date: 'May 01, 2026', description: 'Pickup Fee - Metro', amount: 8500, status: 'Pending' }
];

/* ── Helpers ── */
let routeCounter = 5;
const getNextTime = () => {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const h = hours[routeCounter % hours.length];
  routeCounter++;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
};

let listingIdCounter = 4;
let trxIdCounter = 105;
let certIdCounter = 501;

/* ═══════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════ */
export const DisposalProvider = ({ children }) => {
  /* ── Service Listings (D2) ── */
  const [serviceListings, setServiceListings] = useState(INITIAL_LISTINGS);

  /* ── Pickup Requests (D3) — all tabs ── */
  const [incomingRequests, setIncomingRequests] = useState(INITIAL_INCOMING);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState(INITIAL_COMPLETED);

  /* ── Confirmed Schedule (D4) ── */
  const [todaysRoute, setTodaysRoute] = useState(INITIAL_ROUTE);

  /* ── Company Profile (D6) ── */
  const [companyProfile, setCompanyProfile] = useState(INITIAL_PROFILE);

  /* ── Earnings (D7) ── */
  const [earningsData, setEarningsData] = useState(INITIAL_EARNINGS);

  // Ref to avoid nested-setState StrictMode bug
  const incomingRef = useRef(incomingRequests);
  incomingRef.current = incomingRequests;

  // ─── Base stats ───
  const baseTonnesProcessed = 4.2; // base value
  
  /* ═══════════════ SERVICE LISTING ACTIONS (D2) ═══════════════ */

  const addListing = useCallback((listing) => {
    const newId = `LST-${String(listingIdCounter++).padStart(3, '0')}`;
    setServiceListings(prev => {
      if (prev.some(l => l.id === newId)) return prev;
      return [
        {
          id: newId,
          ...listing,
          status: 'Active',
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
        ...prev,
      ];
    });
  }, []);

  const toggleListingStatus = useCallback((listingId) => {
    setServiceListings(prev =>
      prev.map(l =>
        l.id === listingId
          ? { ...l, status: l.status === 'Active' ? 'Paused' : 'Active' }
          : l
      )
    );
  }, []);

  const deleteListing = useCallback((listingId) => {
    setServiceListings(prev => prev.filter(l => l.id !== listingId));
  }, []);

  /* ═══════════════ REQUEST ACTIONS (D1 / D3) ═══════════════ */

  const acceptRequest = useCallback((requestId) => {
    const request = incomingRef.current.find(r => r.id === requestId);
    if (!request) return;

    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));

    setAcceptedRequests(prev => {
      if (prev.some(r => r.id === requestId)) return prev;
      return [...prev, { ...request, acceptedAt: new Date().toLocaleString() }];
    });

    // Also add to confirmed schedule (D4)
    const routeId = `RT-${requestId}`;
    setTodaysRoute(prev => {
      if (prev.some(r => r.id === routeId)) return prev;
      return [
        ...prev,
        {
          id: routeId,
          generator: request.generator,
          address: request.location,
          time: getNextTime(),
          wasteType: request.wasteType,
          status: 'Upcoming',
        }
      ];
    });
  }, []);

  const declineRequest = useCallback((requestId) => {
    const request = incomingRef.current.find(r => r.id === requestId);
    if (!request) return;

    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));

    setDeclinedRequests(prev => {
      if (prev.some(r => r.id === requestId)) return prev;
      return [...prev, { ...request, declinedAt: new Date().toLocaleString() }];
    });
  }, []);

  /* ═══════════════ CERTIFICATE ACTIONS (D5) ═══════════════ */
  
  const issueCertificate = useCallback((requestId, feeAmount) => {
    setCompletedRequests(prev => 
      prev.map(r => 
        r.id === requestId 
          ? { ...r, certificateIssued: true, certId: `CERT-${certIdCounter++}`, issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } 
          : r
      )
    );

    // Add to earnings
    if (feeAmount && !isNaN(feeAmount) && feeAmount > 0) {
       const newEarning = {
         id: `TRX-${trxIdCounter++}`,
         date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
         description: `Certificate Fee - ${requestId}`,
         amount: parseFloat(feeAmount),
         status: 'Paid'
       };
       setEarningsData(prev => [newEarning, ...prev]);
    }
  }, []);

  /* ═══════════════ PROFILE ACTIONS (D6) ═══════════════ */
  const updateProfile = useCallback((newProfileData) => {
    setCompanyProfile(prev => {
      // Calculate new initials if name changed
      let initials = prev.initials;
      if (newProfileData.name && newProfileData.name !== prev.name) {
        const words = newProfileData.name.trim().split(' ');
        if (words.length > 1) {
          initials = (words[0][0] + words[1][0]).toUpperCase();
        } else {
          initials = newProfileData.name.substring(0, 2).toUpperCase();
        }
      }
      return { ...prev, ...newProfileData, initials };
    });
  }, []);

  /* ═══════════════ COMPUTED STATS ═══════════════ */

  // Calculate dynamic tonnes processed from issued certificates
  const issuedCerts = completedRequests.filter(r => r.certificateIssued);
  const additionalTonnes = issuedCerts.reduce((sum, req) => sum + (req.weightNum / 1000), 0);
  const totalTonnes = (baseTonnesProcessed + additionalTonnes).toFixed(2);

  // Calculate dynamic revenue
  const totalRevenue = earningsData
    .filter(e => e.status === 'Paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const stats = {
    incomingCount: incomingRequests.length,
    scheduledCount: todaysRoute.length,
    tonnesProcessed: totalTonnes,
    revenue: totalRevenue,
    activeListings: serviceListings.filter(l => l.status === 'Active').length,
    totalListings: serviceListings.length,
  };

  /* ═══════════════ CONTEXT VALUE ═══════════════ */

  const value = {
    // D2
    serviceListings,
    addListing,
    toggleListingStatus,
    deleteListing,
    // D3
    incomingRequests,
    acceptedRequests,
    declinedRequests,
    completedRequests,
    // D4
    todaysRoute,
    // D5
    issueCertificate,
    // D6
    companyProfile,
    updateProfile,
    // D7
    earningsData,
    // D1 + shared
    stats,
    acceptRequest,
    declineRequest,
  };

  return (
    <DisposalContext.Provider value={value}>
      {children}
    </DisposalContext.Provider>
  );
};

/* ── Hook ── */
export const useDisposal = () => {
  const ctx = useContext(DisposalContext);
  if (!ctx) throw new Error('useDisposal must be used inside <DisposalProvider>');
  return ctx;
};

export default DisposalContext;
