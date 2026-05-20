import { useState, useEffect } from 'react';
import { Inbox, Check, X, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import { Link } from 'react-router-dom';
import './PickupRequests.css';

const PickupRequests = () => {
  const {
    incomingRequests,
    acceptedRequests,
    declinedRequests,
    completedRequests,
    acceptRequest,
    declineRequest,
    stats,
  } = useDisposal();

  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const tabs = [
    { id: 'incoming', label: 'Incoming', count: incomingRequests.length },
    { id: 'accepted', label: 'Accepted', count: acceptedRequests.length },
    { id: 'declined', label: 'Declined', count: declinedRequests.length },
    { id: 'completed', label: 'Completed', count: completedRequests.length },
  ];

  const getActiveList = () => {
    switch (activeTab) {
      case 'incoming': return incomingRequests;
      case 'accepted': return acceptedRequests;
      case 'declined': return declinedRequests;
      case 'completed': return completedRequests;
      default: return [];
    }
  };

  const activeList = getActiveList();

  const getStatusBadge = (tab) => {
    switch (tab) {
      case 'incoming': return <span className="status-badge status-pending">Pending</span>;
      case 'accepted': return <span className="status-badge status-confirmed">Accepted</span>;
      case 'declined': return <span className="status-badge status-cancelled">Declined</span>;
      case 'completed': return <span className="status-badge status-completed">Completed</span>;
      default: return null;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'incoming': return 'No incoming requests right now.';
      case 'accepted': return 'No accepted requests yet. Accept incoming requests to see them here.';
      case 'declined': return 'No declined requests.';
      case 'completed': return 'No completed pickups yet.';
      default: return 'No requests found.';
    }
  };

  return (
    <div className="pickup-requests-page">

      {/* SUMMARY STRIP — shows live stats connected to other pages */}
      <div className="dashboard-card summary-strip">
        <div className="summary-item">
          <span className="summary-number">{stats.incomingCount}</span>
          <span className="summary-label">Incoming</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-item">
          <span className="summary-number summary-green">{acceptedRequests.length}</span>
          <span className="summary-label">Accepted</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-item">
          <span className="summary-number">{stats.scheduledCount}</span>
          <span className="summary-label">On Schedule</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-item">
          <Link to="/operator/schedule" className="summary-link">
            View Schedule <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="dashboard-card tab-card">
        <div className="segmented-control requests-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`segment-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* REQUEST CARDS */}
      <div className="requests-list">
        {activeList.length === 0 && (
          <div className="dashboard-card empty-state-card">
            <div className="empty-state-content">
              <Inbox size={40} />
              <h3>{getEmptyMessage()}</h3>
            </div>
          </div>
        )}

        {activeList.map((req) => (
          <div key={req.id} className="dashboard-card request-full-card">
            <div className="request-full-top">
              <div className="request-full-info">
                <div className="request-avatar-lg">{req.avatar}</div>
                <div className="request-full-details">
                  <div className="request-full-header">
                    <h3>{req.generator}</h3>
                    {getStatusBadge(activeTab)}
                  </div>
                  <span className="request-id">{req.id}</span>
                </div>
              </div>
            </div>

            <div className="request-full-meta">
              <div className="meta-item">
                <label>Waste Type</label>
                <span>{req.wasteType}</span>
              </div>
              <div className="meta-item">
                <label>Weight</label>
                <span>{req.weight}</span>
              </div>
              <div className="meta-item">
                <label>Preferred Date</label>
                <span>{req.date}</span>
              </div>
              <div className="meta-item">
                <label>Location</label>
                <span className="meta-location">
                  <MapPin size={13} />
                  {req.location}
                </span>
              </div>
              {req.email && (
                <div className="meta-item">
                  <label>Email</label>
                  <span>{req.email}</span>
                </div>
              )}
              {req.phone && (
                <div className="meta-item">
                  <label>Phone</label>
                  <span>{req.phone}</span>
                </div>
              )}
            </div>

            {/* Actions based on tab */}
            <div className="request-full-actions">
              {activeTab === 'incoming' && (
                <>
                  <button className="action-btn-accept" onClick={() => acceptRequest(req.id)}>
                    <Check size={16} />
                    <span>Accept & Add to Schedule</span>
                  </button>
                  <button className="action-btn-decline" onClick={() => declineRequest(req.id)}>
                    <X size={16} />
                    <span>Decline</span>
                  </button>
                </>
              )}
              {activeTab === 'accepted' && (
                <div className="accepted-info">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Accepted {req.acceptedAt} — Added to Schedule</span>
                </div>
              )}
              {activeTab === 'declined' && (
                <div className="declined-info">
                  <X size={16} className="text-red" />
                  <span>Declined {req.declinedAt}</span>
                </div>
              )}
              {activeTab === 'completed' && (
                <div className="completed-info">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Completed {req.completedDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PickupRequests;
