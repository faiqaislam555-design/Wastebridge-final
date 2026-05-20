import { useState, useEffect } from 'react';
import { Award, CheckCircle2, FileText, Search, PlusCircle } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import './CertificateIssuer.css';

const CertificateIssuer = () => {
  const { completedRequests, issueCertificate } = useDisposal();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const pendingJobs = completedRequests.filter(r => !r.certificateIssued);
  const issuedCerts = completedRequests.filter(r => r.certificateIssued);

  const activeList = activeTab === 'pending' ? pendingJobs : issuedCerts;
  const filteredList = activeList.filter(item => 
    item.generator.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssue = (id) => {
    // Generate a mock fee for the certificate (e.g. 5000)
    issueCertificate(id, 5000);
  };

  return (
    <div className="certificates-page">
      <div className="page-header">
        <div>
          <h2>Certificate Issuer</h2>
          <p className="subtitle">Issue official disposal certificates for completed jobs.</p>
        </div>
      </div>

      <div className="dashboard-card cert-controls">
        <div className="segmented-control cert-tabs">
          <button 
            className={`segment-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingJobs.length})
          </button>
          <button 
            className={`segment-btn ${activeTab === 'issued' ? 'active' : ''}`}
            onClick={() => setActiveTab('issued')}
          >
            Issued ({issuedCerts.length})
          </button>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by ID or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="cert-list">
        {filteredList.length === 0 && (
          <div className="dashboard-card empty-state-card">
            <div className="empty-state-content">
              <FileText size={40} />
              <h3>No records found</h3>
              <p>Try adjusting your search or check another tab.</p>
            </div>
          </div>
        )}

        {filteredList.map(req => (
          <div key={req.id} className="dashboard-card cert-card">
            <div className="cert-card-header">
              <div className="cert-title-group">
                <div className="cert-icon">
                  <Award size={20} />
                </div>
                <div>
                  <h3>{req.generator}</h3>
                  <span className="req-id">{req.id}</span>
                </div>
              </div>
              <div className="cert-date">
                Completed: {req.completedDate}
              </div>
            </div>
            
            <div className="cert-card-body">
              <div className="cert-stat">
                <span className="stat-label">Waste Type</span>
                <span className="stat-value">{req.wasteType}</span>
              </div>
              <div className="cert-stat">
                <span className="stat-label">Weight Processed</span>
                <span className="stat-value">{req.weight}</span>
              </div>
              {req.certificateIssued && (
                <div className="cert-stat">
                  <span className="stat-label">Certificate ID</span>
                  <span className="stat-value text-green">{req.certId}</span>
                </div>
              )}
            </div>

            <div className="cert-card-actions">
              {!req.certificateIssued ? (
                <button className="btn btn-primary btn-sm issue-btn" onClick={() => handleIssue(req.id)}>
                  <PlusCircle size={16} /> Issue Certificate
                </button>
              ) : (
                <div className="issued-status">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Issued on {req.issuedDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificateIssuer;
