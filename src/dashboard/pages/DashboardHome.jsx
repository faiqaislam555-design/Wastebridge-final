import { useState, useEffect } from 'react';
import { Clock, Truck, Recycle, Leaf, Plus, FilePlus, FileText, CheckCircle, CreditCard, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchPickups } from '../../services/api';

const wasteTypeLabels = {
  cooked: 'Cooked Food',
  raw: 'Raw Scraps',
  expired: 'Expired Stock',
  packaging: 'Packaging-Contaminated',
};

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Run both requests in parallel
        const [statsData, pickupsData] = await Promise.all([
          fetchDashboardStats(),
          fetchPickups(),
        ]);
        setStats(statsData);
        setPickups(pickupsData.slice(0, 4)); // Show latest 4
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = stats ? [
    { label: 'Pending Requests',         value: String(stats.pending_requests),             icon: <Clock   size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'Upcoming Pickups This Week', value: String(stats.upcoming_pickups_week),       icon: <Truck   size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'Waste Diverted This Month', value: `${stats.waste_diverted_month_kg} kg`,     icon: <Recycle size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'CO₂ Saved This Month',      value: `${stats.co2_saved_month_kg} kg eq.`,      icon: <Leaf    size={24} color="#059669" />, bgColor: '#ecfdf5' },
  ] : [
    { label: 'Pending Requests',           value: '—', icon: <Clock   size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'Upcoming Pickups This Week', value: '—', icon: <Truck   size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'Waste Diverted This Month',  value: '—', icon: <Recycle size={24} color="#059669" />, bgColor: '#ecfdf5' },
    { label: 'CO₂ Saved This Month',       value: '—', icon: <Leaf    size={24} color="#059669" />, bgColor: '#ecfdf5' },
  ];

  // Build activity feed from real pickup data
  const recentActivity = pickups.length > 0
    ? pickups.map(p => ({
        id: p.id,
        action: `Pickup ${p.status} — ${wasteTypeLabels[p.waste_type] || p.waste_type}`,
        time: new Date(p.created_at).toLocaleDateString(),
        icon: <CheckCircle size={16} />,
      }))
    : [
        { id: 1, action: 'Log your first waste batch to get started', time: 'Now', icon: <FilePlus size={16} /> },
      ];

  if (loading) {
    return (
      <div className="dashboard-home" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">

      {/* STAT CARDS */}
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

      <div className="dashboard-grid">

        {/* LEFT: UPCOMING PICKUPS */}
        <div className="dashboard-card pickups-section">
          <div className="card-header">
            <h2>Upcoming Pickups</h2>
            <Link to="/generator/history" className="view-all-link">View all</Link>
          </div>

          <div className="pickup-list">
            {pickups.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                No pickups yet. Log waste and request your first pickup!
              </p>
            ) : (
              pickups.map((pickup) => (
                <div key={pickup.id} className="pickup-item">
                  <div className="operator-info">
                    <div className="operator-logo">
                      {pickup.transaction_id ? pickup.transaction_id.charAt(4) : 'P'}
                    </div>
                    <div className="operator-details">
                      <h4>{pickup.transaction_id || `#${pickup.id}`}</h4>
                      <span className="pickup-type">{wasteTypeLabels[pickup.waste_type] || pickup.waste_type}</span>
                    </div>
                  </div>
                  <div className="pickup-meta">
                    <div className="pickup-time">
                      <Clock size={14} />
                      <span>{pickup.scheduled_time || new Date(pickup.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`status-badge status-${pickup.status.toLowerCase()}`}>
                      {pickup.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: RECENT ACTIVITY */}
        <div className="dashboard-card activity-section">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>

          <div className="timeline">
            {recentActivity.map((activity, idx) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-icon">{activity.icon}</div>
                <div className="timeline-content">
                  <p>{activity.action}</p>
                  <span>{activity.time}</span>
                </div>
                {idx !== recentActivity.length - 1 && <div className="timeline-connector"></div>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FAB */}
      <Link to="/generator/log-waste" className="fab-button" aria-label="Log Waste">
        <Plus size={24} />
        Log Waste
      </Link>

    </div>
  );
};

export default DashboardHome;
