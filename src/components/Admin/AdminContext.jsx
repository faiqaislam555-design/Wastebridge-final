import { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext(null);

/* ── Initial Mock Data ── */
const INITIAL_COMPANIES = [
  { id: 'COMP-101', name: 'Green Dispose Pvt Ltd', type: 'Disposal', licenses: 'CPCB/SWM/2026/01', appliedOn: 'May 01, 2026', status: 'Pending' },
  { id: 'COMP-102', name: 'BioConvert Lahore', type: 'Disposal', licenses: 'EPA/PUNJ/2025/11', appliedOn: 'Apr 30, 2026', status: 'Pending' },
  { id: 'COMP-090', name: 'EcoCycle Lahore', type: 'Disposal', licenses: 'EPA Punjab, PSQCA', appliedOn: 'Jan 15, 2026', status: 'Approved' },
  { id: 'COMP-085', name: 'WasteNoMore', type: 'Disposal', licenses: 'EPA/SINDH/2025/08', appliedOn: 'Dec 10, 2025', status: 'Rejected' }
];

const INITIAL_DISPUTES = [
  { id: 'DSP-042', relatedJob: 'REQ-0985', generator: 'Lahore Grammar School', operator: 'EcoCycle Lahore', issue: 'Weight Discrepancy reported by Generator', status: 'Unresolved', date: 'May 01, 2026', messages: [] },
  { id: 'DSP-041', relatedJob: 'REQ-0901', generator: 'Haveli Restaurant', operator: 'BioConvert Lahore', issue: 'Delayed pickup by 4 hours', status: 'Resolved', date: 'Apr 28, 2026', messages: [], notes: 'Operator apologized and offered discount.', resolvedAt: 'Apr 29, 2026' }
];

const INITIAL_ANALYTICS = [
  { day: 'Mon', volume: 12.5, signups: 5 },
  { day: 'Tue', volume: 13.0, signups: 8 },
  { day: 'Wed', volume: 14.2, signups: 4 },
  { day: 'Thu', volume: 15.1, signups: 10 },
  { day: 'Fri', volume: 14.8, signups: 7 },
  { day: 'Sat', volume: 11.0, signups: 3 },
  { day: 'Sun', volume: 9.5, signups: 2 },
];

export const AdminProvider = ({ children }) => {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [analyticsData] = useState(INITIAL_ANALYTICS);

  /* ── Actions ── */
  const approveCompany = useCallback((companyId) => {
    setCompanies(prev => prev.map(c => 
      c.id === companyId ? { ...c, status: 'Approved' } : c
    ));
  }, []);

  const rejectCompany = useCallback((companyId) => {
    setCompanies(prev => prev.map(c => 
      c.id === companyId ? { ...c, status: 'Rejected' } : c
    ));
  }, []);

  const resolveDispute = useCallback((disputeId, resolutionNotes) => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId ? { ...d, status: 'Resolved', notes: resolutionNotes, resolvedAt: new Date().toLocaleDateString() } : d
    ));
  }, []);

  /* ── Computed Stats ── */
  const stats = {
    pendingVerifications: companies.filter(c => c.status === 'Pending').length,
    activeUsers: 450 + companies.filter(c => c.status === 'Approved').length,
    dailyVolume: '14.2t',
    unresolvedDisputes: disputes.filter(d => d.status === 'Unresolved').length,
    totalVolumeWeek: analyticsData.reduce((sum, item) => sum + item.volume, 0).toFixed(1) + 't',
    totalSignupsWeek: analyticsData.reduce((sum, item) => sum + item.signups, 0)
  };

  const value = {
    companies,
    approveCompany,
    rejectCompany,
    disputes,
    resolveDispute,
    analyticsData,
    stats
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
