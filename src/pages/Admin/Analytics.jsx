import { TrendingUp, Users, Target } from 'lucide-react';
import { useAdmin } from '../../components/Admin/AdminContext';
import './Analytics.css';

const Analytics = () => {
  const { analyticsData, stats } = useAdmin();

  // Find max values for chart scaling
  const maxVolume = Math.max(...analyticsData.map(d => d.volume));
  const maxSignups = Math.max(...analyticsData.map(d => d.signups));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h2>System Analytics</h2>
          <p className="subtitle">Track platform growth, volume, and engagement metrics over the last 7 days.</p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>Weekly Waste Volume</h3>
            <div className="stat-icon" style={{background: '#dcfce7', color: '#16a34a'}}><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{stats.totalVolumeWeek}</div>
          <div className="stat-trend trend-up">Across all categories</div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>New User Signups</h3>
            <div className="stat-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}><Users size={20} /></div>
          </div>
          <div className="stat-value">{stats.totalSignupsWeek}</div>
          <div className="stat-trend trend-up">Last 7 days</div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-header">
            <h3>Dispute Resolution Rate</h3>
            <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}><Target size={20} /></div>
          </div>
          <div className="stat-value">92%</div>
          <div className="stat-trend trend-up">Resolved within 48h</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Volume Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Daily Waste Processed (Tons)</h3>
            <div className="chart-total">{stats.totalVolumeWeek}</div>
          </div>
          
          <div className="css-bar-chart">
            {analyticsData.map((data, index) => {
              const heightPercent = (data.volume / maxVolume) * 100;
              return (
                <div key={index} className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{height: `${Math.max(heightPercent, 5)}%`}}
                  >
                    <div className="bar-value-tooltip">{data.volume}t</div>
                  </div>
                  <span className="bar-label">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signups Chart */}
        <div className="chart-card chart-secondary">
          <div className="chart-header">
            <h3>New Registrations</h3>
            <div className="chart-total">{stats.totalSignupsWeek} Users</div>
          </div>
          
          <div className="css-bar-chart">
            {analyticsData.map((data, index) => {
              const heightPercent = (data.signups / maxSignups) * 100;
              return (
                <div key={index} className="bar-wrapper">
                  <div 
                    className="bar bar-secondary" 
                    style={{height: `${Math.max(heightPercent, 5)}%`}}
                  >
                    <div className="bar-value-tooltip">{data.signups}</div>
                  </div>
                  <span className="bar-label">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
