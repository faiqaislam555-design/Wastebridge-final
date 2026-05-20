import { useState, useEffect } from 'react';
import { Filter, ChevronDown, FileText, CheckCircle, AlertTriangle, XCircle, Eye, X, Clock } from 'lucide-react';
import { fetchPickups } from '../../services/api';
import '../styles/PickupHistory.css';

const wasteTypeLabels = {
  cooked: 'Cooked Food',
  raw: 'Raw Scraps',
  expired: 'Expired Stock',
  packaging: 'Packaging-Contaminated',
};

const PickupHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'all',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchPickups({
          status: filters.status,
          date_range: filters.dateRange,
        });

        // Map backend PickupRequestOut fields to display shape
        const mapped = data.map(p => ({
          id: p.transaction_id || `TRX-${p.id}`,
          rawId: p.id,
          date: new Date(p.created_at).toLocaleDateString(),
          // operator_profile_id is what the backend returns (not operator_id)
          partner: p.operator_profile_id
            ? `Operator #${p.operator_profile_id}`
            : 'Any Operator',
          wasteType: wasteTypeLabels[p.waste_type] || p.waste_type,
          weight: p.weight_kg != null ? `${p.weight_kg} kg` : '—',
          status: p.status,
          // certificate_file / invoice_file are the backend field names
          certificate: p.certificate_file || 'Pending',
          invoice: p.invoice_file || 'Pending',
          notes: p.operator_notes || 'No notes',
          cost: p.cost ? `₨ ${p.cost}` : 'Pending',
          scheduledTime: p.scheduled_time || '—',
        }));

        setHistoryData(mapped);
      } catch (err) {
        setError('Failed to load pickup history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [filters.status, filters.dateRange]);

  const handleFilterChange = (e, filterName) => {
    setFilters(prev => ({ ...prev, [filterName]: e.target.value }));
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return <span className="status-badge status-completed"><CheckCircle size={14} /> Completed</span>;
    if (s === 'disputed')  return <span className="status-badge status-disputed"><AlertTriangle size={14} /> Disputed</span>;
    if (s === 'cancelled') return <span className="status-badge status-cancelled"><XCircle size={14} /> Cancelled</span>;
    if (s === 'confirmed') return <span className="status-badge status-confirmed"><CheckCircle size={14} /> Confirmed</span>;
    return <span className="status-badge status-pending"><Clock size={14} /> {status || 'Pending'}</span>;
  };

  return (
    <div className="pickup-history-page">

      {/* FILTER BAR */}
      <div className="dashboard-card filter-card">
        <div className="mobile-filter-header">
          <h3>Pickup History</h3>
          <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className={`filter-bar ${mobileFilterOpen ? 'filter-bar-open' : ''}`}>
          <div className="filter-group">
            <label>Date Range</label>
            <div className="custom-select">
              <select value={filters.dateRange} onChange={(e) => handleFilterChange(e, 'dateRange')}>
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="custom-select">
              <select value={filters.status} onChange={(e) => handleFilterChange(e, 'status')}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Disputed">Disputed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="dashboard-card table-card">
        {isLoading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading pickup history...
          </div>
        )}
        {error && (
          <div style={{ padding: '20px', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', margin: '16px' }}>
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Desktop Table */}
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Operator</th>
                    <th>Waste Type</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Documents</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-state">No pickup records found.</td>
                    </tr>
                  )}
                  {historyData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="table-date">{item.date}</span>
                        <span className="table-id">{item.id}</span>
                      </td>
                      <td className="font-medium">{item.partner}</td>
                      <td>{item.wasteType}</td>
                      <td>{item.weight}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        <div className="doc-icons">
                          {item.certificate !== 'Pending' ? (
                            <FileText size={18} className="doc-icon cert-icon" title="Certificate Available" />
                          ) : (
                            <span className="no-docs">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="btn-text view-details-btn" onClick={() => setSelectedPickup(item)}>
                          <Eye size={16} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="mobile-history-list">
              {historyData.length === 0 && <div className="empty-state">No records found.</div>}
              {historyData.map((item) => (
                <div key={item.id} className="history-list-card">
                  <div className="history-list-header">
                    <div className="hl-date-id">
                      <strong>{item.date}</strong>
                      <span>{item.id}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="history-list-body">
                    <p><strong>Operator:</strong> {item.partner}</p>
                    <p><strong>Waste:</strong> {item.wasteType} ({item.weight})</p>
                  </div>
                  <div className="history-list-footer">
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedPickup(item)}>
                      View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedPickup && (
        <div className="modal-overlay" onClick={() => setSelectedPickup(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Pickup Details</h2>
                <span className="modal-id">{selectedPickup.id}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedPickup(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Status</label>
                  <div>{getStatusBadge(selectedPickup.status)}</div>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <p>{selectedPickup.date}</p>
                </div>
                <div className="detail-item">
                  <label>Operator</label>
                  <p>{selectedPickup.partner}</p>
                </div>
                <div className="detail-item">
                  <label>Waste Type</label>
                  <p>{selectedPickup.wasteType}</p>
                </div>
                <div className="detail-item">
                  <label>Weight</label>
                  <p><strong>{selectedPickup.weight}</strong></p>
                </div>
                <div className="detail-item">
                  <label>Scheduled Time</label>
                  <p>{selectedPickup.scheduledTime}</p>
                </div>
                <div className="detail-item">
                  <label>Cost</label>
                  <p>{selectedPickup.cost}</p>
                </div>
              </div>

              <div className="detail-notes">
                <label>Operator Notes</label>
                <p>{selectedPickup.notes}</p>
              </div>

              <div className="modal-documents">
                <h3>Documents</h3>
                <div className="doc-list">
                  <div className="doc-card">
                    <div className="doc-info">
                      <FileText size={24} className="cert-icon" />
                      <div>
                        <strong>Disposal Certificate</strong>
                        <span>{selectedPickup.certificate}</span>
                      </div>
                    </div>
                    <span className="doc-status-text">{selectedPickup.certificate === 'Pending' ? 'Pending' : 'Available'}</span>
                  </div>
                  <div className="doc-card">
                    <div className="doc-info">
                      <FileText size={24} className="inv-icon" />
                      <div>
                        <strong>Financial Invoice</strong>
                        <span>{selectedPickup.invoice}</span>
                      </div>
                    </div>
                    <span className="doc-status-text">{selectedPickup.invoice === 'Pending' ? 'Pending' : 'Available'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupHistory;
