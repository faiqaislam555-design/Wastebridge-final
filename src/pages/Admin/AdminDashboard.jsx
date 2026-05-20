import { useEffect } from 'react';
import { ShieldCheck, Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../components/Admin/AdminContext';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { stats, disputes } = useAdmin();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const unresolvedDisputes = disputes.filter(d => d.status === 'Unresolved');

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h2>Admin Overview</h2>
          <p className="subtitle">System-wide statistics and required actions.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="admin-stats-grid">
        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>Pending Verifications</h3>
            <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.pendingVerifications}</div>
          <div className="stat-trend text-gray">Companies awaiting approval</div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>Active Users</h3>
            <div className="stat-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-trend text-gray">Generators & Operators</div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>Daily Volume</h3>
            <div className="stat-icon" style={{background: '#dcfce7', color: '#16a34a'}}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.dailyVolume}</div>
          <div className="stat-trend trend-up"><span>+5%</span> vs yesterday</div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="admin-section">
        <div className="section-header-flex">
          <h3>Action Required: Disputes</h3>
          <Link to="/admin/disputes" className="view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {unresolvedDisputes.length === 0 ? (
          <div className="dashboard-card empty-state-card">
            <div className="empty-state-content">
              <ShieldCheck size={40} className="text-green" />
              <h3>All clear!</h3>
              <p>There are no unresolved disputes at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="alerts-grid">
            {unresolvedDisputes.map(dispute => (
              <div key={dispute.id} className="dashboard-card alert-card">
                <div className="alert-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <h4>{dispute.id} - {dispute.issue}</h4>
                    <span className="status-badge status-pending">Action Needed</span>
                  </div>
                  <p><strong>Generator:</strong> {dispute.generator} | <strong>Operator:</strong> {dispute.operator}</p>
                  <p className="alert-date">Reported: {dispute.date}</p>
                </div>
                <div className="alert-action">
                  <Link to="/admin/disputes" className="btn btn-outline btn-sm">Review</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
