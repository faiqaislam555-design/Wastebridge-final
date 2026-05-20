import { useState, useEffect } from 'react';
import { Download, Search, Filter, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import './Earnings.css';

const Earnings = () => {
  const { earningsData, completedRequests, stats } = useDisposal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Compute local stats
  const pendingPayments = earningsData
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  // Filter transactions
  const filteredData = earningsData.filter(trx => {
    const matchesSearch = trx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || trx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return <span className="status-badge status-active">Paid</span>;
      case 'Pending': return <span className="status-badge status-pending">Pending</span>;
      case 'Overdue': return <span className="status-badge status-cancelled">Overdue</span>;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    return '₨ ' + amount.toLocaleString();
  };

  return (
    <div className="earnings-page">
      <div className="page-header">
        <div>
          <h2>Earnings & Revenue</h2>
          <p className="subtitle">Track your income from pickups, material sales, and certificates.</p>
        </div>
        <button className="btn btn-primary btn-sm export-btn">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="earnings-stats-grid">
        <div className="dashboard-card stat-card earnings-stat">
          <div className="stat-header">
            <h3>Revenue This Month</h3>
            <div className="stat-icon green-icon"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(stats.revenue)}</div>
          <div className="stat-trend trend-up">
            <span>+12.5%</span> from last month
          </div>
        </div>
        <div className="dashboard-card stat-card earnings-stat">
          <div className="stat-header">
            <h3>Pending Payments</h3>
            <div className="stat-icon orange-icon"><Clock size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(pendingPayments)}</div>
          <div className="stat-trend text-gray">
            {earningsData.filter(e => e.status === 'Pending').length} invoices awaiting payment
          </div>
        </div>
        <div className="dashboard-card stat-card earnings-stat">
          <div className="stat-header">
            <h3>Completed Jobs</h3>
            <div className="stat-icon blue-icon"><CheckCircle2 size={20} /></div>
          </div>
          <div className="stat-value">{completedRequests.length}</div>
          <div className="stat-trend text-gray">
            All-time completed requests
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="dashboard-card transactions-card">
        <div className="transactions-header">
          <h3>Transaction History</h3>
          <div className="transactions-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search description or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={16} className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="basic-select"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="empty-state-inline">
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table earnings-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(trx => (
                  <tr key={trx.id}>
                    <td className="trx-id">{trx.id}</td>
                    <td className="trx-date">{trx.date}</td>
                    <td className="trx-desc">{trx.description}</td>
                    <td className="text-right trx-amount font-mono">
                      {formatCurrency(trx.amount)}
                    </td>
                    <td className="text-right">
                      {getStatusBadge(trx.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile View (Cards) */}
        <div className="mobile-history-list">
          {filteredData.map(trx => (
            <div key={trx.id} className="mobile-history-card">
              <div className="mhc-header">
                <span className="mhc-id">{trx.id}</span>
                {getStatusBadge(trx.status)}
              </div>
              <div className="mhc-desc">{trx.description}</div>
              <div className="mhc-footer">
                <span className="mhc-date">{trx.date}</span>
                <span className="mhc-amount font-mono">{formatCurrency(trx.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
