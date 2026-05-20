import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CalendarCheck, Weight, DollarSign, Clock, MapPin, Check, X, Truck } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import './DisposalDashboard.css';

const DisposalDashboard = () => {
  const {
    incomingRequests,
    todaysRoute,
    stats,
    acceptRequest,
    declineRequest,
  } = useDisposal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Build stat cards from live context */
  const statCards = [
    { label: 'Incoming Requests', value: stats.incomingCount, icon: <Inbox size={24} color="#2563eb" />, bgColor: '#eff6ff' },
    { label: 'Scheduled Pickups', value: stats.scheduledCount, icon: <CalendarCheck size={24} color="#2563eb" />, bgColor: '#eff6ff' },
    { label: 'Tonnes Processed', value: `${stats.tonnesProcessed} t`, icon: <Weight size={24} color="#2563eb" />, bgColor: '#eff6ff' },
    { label: 'Revenue This Month', value: `₨ ${stats.revenue.toLocaleString()}`, icon: <DollarSign size={24} color="#2563eb" />, bgColor: '#eff6ff' },
  ];

  return (
    <div className="disposal-dashboard">
      
      {/* STAT CARDS ROW */}
      <div className="stats-row">
        {statCards.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bgColor }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN GRID */}
      <div className="dashboard-grid">

        {/* LEFT: INCOMING REQUESTS */}
        <div className="dashboard-card requests-section">
          <div className="card-header">
            <h2>Incoming Requests</h2>
            <Link to="/operator/requests" className="view-all-link">View all</Link>
          </div>

          <div className="request-list">
            {incomingRequests.length === 0 && (
              <div className="empty-state-inline">
                <Inbox size={32} />
                <p>No incoming requests right now</p>
              </div>
            )}
            {incomingRequests.map((req) => (
              <div key={req.id} className="request-item">
                <div className="request-info">
                  <div className="request-avatar">{req.avatar}</div>
                  <div className="request-details">
                    <h4>{req.generator}</h4>
                    <div className="request-meta-row">
                      <span className="request-type">{req.wasteType}</span>
                      <span className="request-dot">•</span>
                      <span className="request-weight">{req.weight}</span>
                    </div>
                    <div className="request-time">
                      <Clock size={13} />
                      <span>{req.date}</span>
                    </div>
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    className="action-btn-accept"
                    title="Accept Request"
                    onClick={() => acceptRequest(req.id)}
                  >
                    <Check size={16} />
                    <span>Accept</span>
                  </button>
                  <button
                    className="action-btn-decline"
                    title="Decline Request"
                    onClick={() => declineRequest(req.id)}
                  >
                    <X size={16} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TODAY'S ROUTE */}
        <div className="dashboard-card route-section">
          <div className="card-header">
            <h2>Today's Route</h2>
            <Link to="/operator/schedule" className="view-all-link">Full schedule</Link>
          </div>

          <div className="route-list">
            {todaysRoute.length === 0 && (
              <div className="empty-state-inline">
                <Truck size={32} />
                <p>No pickups scheduled today</p>
              </div>
            )}
            {todaysRoute.map((stop, idx) => (
              <div key={stop.id} className="route-item">
                <div className="route-number">
                  <span>{idx + 1}</span>
                </div>
                <div className="route-content">
                  <div className="route-header">
                    <h4>{stop.generator}</h4>
                    <span className={`route-status status-${stop.status.toLowerCase().replace(' ', '-')}`}>
                      {stop.status}
                    </span>
                  </div>
                  <div className="route-details">
                    <div className="route-detail">
                      <MapPin size={13} />
                      <span>{stop.address}</span>
                    </div>
                    <div className="route-detail">
                      <Clock size={13} />
                      <span>{stop.time}</span>
                    </div>
                    <div className="route-detail">
                      <Truck size={13} />
                      <span>{stop.wasteType}</span>
                    </div>
                  </div>
                </div>
                {idx !== todaysRoute.length - 1 && <div className="route-connector"></div>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DisposalDashboard;
