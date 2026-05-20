import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Phone, Map, ShieldCheck, Zap, Activity, CheckCircle } from 'lucide-react';
import { fetchWasteLogs, createPickupRequest } from '../../services/api';
import '../styles/RequestPickup.css';

const wasteTypeLabels = {
  cooked: 'Cooked Food',
  raw: 'Raw Scraps',
  expired: 'Expired Stock',
  packaging: 'Packaging-Contaminated',
};

const defaultCompanyData = {
  id: null,
  name: 'Any Available Operator',
  logo: 'O',
  capacity: 'Variable',
  accepts: ['Various'],
  certifications: ['Verified Partner'],
  responseTime: '< 24 Hours',
};

const RequestPickup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(defaultCompanyData);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Pre-fill company from BrowseCompanies navigation
    if (location.state?.company) {
      const c = location.state.company;
      setCompanyData({
        id: c.id,
        name: c.company_name,
        logo: c.logo_letter || c.company_name[0].toUpperCase(),
        capacity: 'Variable (Based on Plan)',
        accepts: (c.service_types || '').split(',').map(s => s.trim()),
        certifications: ['Verified Partner'],
        responseTime: '< 24 Hours',
      });
    }

    fetchWasteLogs()
      .then(setWasteLogs)
      .catch(err => console.error('Failed to fetch waste logs:', err))
      .finally(() => setLogsLoading(false));
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogId) { setError('Please select a waste log.'); return; }
    if (!preferredDate) { setError('Please select a pickup date.'); return; }
    if (!timeWindow)    { setError('Please select a time window.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const selectedLog = wasteLogs.find(l => l.id === parseInt(selectedLogId));
      await createPickupRequest({
        operator_profile_id: companyData.id || undefined,
        waste_log_id: parseInt(selectedLogId),
        waste_type: selectedLog.waste_type,
        weight_kg: selectedLog.weight_kg,
        scheduled_time: `${preferredDate} ${timeWindow}`,
      });
      setSuccess(true);
      setTimeout(() => navigate('/generator/history'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit pickup request.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <CheckCircle size={56} color="#10b981" />
        <h2 style={{ color: '#111827', fontSize: '22px' }}>Pickup Request Sent!</h2>
        <p style={{ color: '#6b7280' }}>Redirecting to your pickup history...</p>
      </div>
    );
  }

  return (
    <div className="request-pickup-page">
      <div className="request-pickup-grid">

        {/* FORM */}
        <div className="dashboard-card form-section">
          <div className="form-header">
            <h2>Schedule a Pickup</h2>
            <p>Request a collection from <strong>{companyData.name}</strong></p>
          </div>

          {error && (
            <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form className="pickup-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Waste Log Reference</label>
              <div className="custom-select">
                <select value={selectedLogId} onChange={(e) => setSelectedLogId(e.target.value)} required>
                  <option value="" disabled>
                    {logsLoading ? 'Loading your logs...' : wasteLogs.length === 0 ? 'No waste logs found — log waste first' : 'Select logged waste...'}
                  </option>
                  {wasteLogs.map(log => (
                    <option key={log.id} value={log.id}>
                      {wasteTypeLabels[log.waste_type] || log.waste_type} — {log.weight_kg} kg
                      {' '}(Logged {new Date(log.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              {!logsLoading && wasteLogs.length === 0 && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#9ca3af' }}>
                  <Link to="/generator/log-waste" style={{ color: '#10b981' }}>Log your first waste batch</Link> before requesting a pickup.
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Time Window</label>
                <div className="input-with-icon">
                  <Clock size={16} className="input-icon" />
                  <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} required>
                    <option value="" disabled>Select time...</option>
                    <option value="Morning (8am-12pm)">Morning (8am – 12pm)</option>
                    <option value="Afternoon (12pm-4pm)">Afternoon (12pm – 4pm)</option>
                    <option value="Evening (4pm-8pm)">Evening (4pm – 8pm)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Link to="/generator/browse" className="cancel-link">Cancel</Link>
              <button type="submit" className="btn btn-primary action-btn"
                disabled={isLoading || logsLoading || wasteLogs.length === 0}>
                {isLoading ? 'Sending...' : 'Send Pickup Request'}
              </button>
            </div>

          </form>
        </div>

        {/* COMPANY SUMMARY */}
        <div className="dashboard-card company-summary-section">
          <div className="summary-header">
            <div className="company-logo-large">{companyData.logo}</div>
            <div className="summary-title">
              <h3>{companyData.name}</h3>
              <span className="summary-badge">Verified Partner</span>
            </div>
          </div>

          <div className="summary-body">
            <div className="summary-item">
              <div className="summary-icon-box"><Activity size={18} /></div>
              <div className="summary-text">
                <span className="summary-label">Processing Capacity</span>
                <span className="summary-value">{companyData.capacity}</span>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon-box"><Map size={18} /></div>
              <div className="summary-text">
                <span className="summary-label">Accepted Waste Types</span>
                <div className="summary-chips">
                  {companyData.accepts.map((t, i) => (
                    <span key={i} className="chip chip-green">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon-box"><ShieldCheck size={18} /></div>
              <div className="summary-text">
                <span className="summary-label">Certifications</span>
                <div className="summary-chips">
                  {companyData.certifications.map((c, i) => (
                    <span key={i} className="chip chip-gray">{c}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon-box"><Zap size={18} /></div>
              <div className="summary-text">
                <span className="summary-label">Avg. Response Time</span>
                <span className="summary-value value-highlight">{companyData.responseTime}</span>
              </div>
            </div>
          </div>

          <div className="summary-footer">
            <p>By requesting a pickup, you agree to WasteBridge's <a href="/">terms of service</a> for B2B waste transfers.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestPickup;
