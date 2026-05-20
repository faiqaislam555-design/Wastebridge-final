import { useState } from 'react';
import { FileText, Calendar, Building, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '../../components/Admin/AdminContext';
import './UserVerification.css';

const UserVerification = () => {
  const { companies, approveCompany, rejectCompany } = useAdmin();
  const [activeTab, setActiveTab] = useState('Pending');

  const filteredCompanies = companies.filter(c => c.status === activeTab);

  return (
    <div className="verification-page">
      <div className="page-header">
        <div>
          <h2>User Verification</h2>
          <p className="subtitle">Review and manage disposal company registrations.</p>
        </div>
      </div>

      <div className="verification-tabs">
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="companies-list">
        {filteredCompanies.length === 0 ? (
          <div className="dashboard-card empty-state-card">
            <CheckCircle size={40} className="text-gray" style={{opacity: 0.5}} />
            <h3>No {activeTab.toLowerCase()} verifications</h3>
            <p>You're all caught up for now.</p>
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div key={company.id} className="company-card">
              <div className="company-info">
                <h4>{company.name} <span className="text-gray" style={{fontSize: '12px', fontWeight: 'normal'}}>({company.id})</span></h4>
                <div className="company-meta">
                  <span className="meta-item"><Building size={14} /> {company.type}</span>
                  <span className="meta-item"><FileText size={14} /> {company.licenses}</span>
                  <span className="meta-item"><Calendar size={14} /> Applied: {company.appliedOn}</span>
                </div>
              </div>

              <div className="company-actions">
                {activeTab === 'Pending' ? (
                  <>
                    <button 
                      className="btn btn-reject btn-sm"
                      onClick={() => rejectCompany(company.id)}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button 
                      className="btn btn-approve btn-sm"
                      onClick={() => approveCompany(company.id)}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  </>
                ) : (
                  <span className={`status-badge ${activeTab.toLowerCase()}`}>
                    {activeTab}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserVerification;
