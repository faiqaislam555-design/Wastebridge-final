import { useState } from 'react';
import { AlertTriangle, CheckCircle, FileText, Building, Truck } from 'lucide-react';
import { useAdmin } from '../../components/Admin/AdminContext';
import './DisputeResolution.css';

const DisputeResolution = () => {
  const { disputes, resolveDispute } = useAdmin();
  const [activeTab, setActiveTab] = useState('Unresolved');
  const [resolutionNotes, setResolutionNotes] = useState({});

  const filteredDisputes = disputes.filter(d => d.status === activeTab);

  const handleResolve = (id) => {
    const notes = resolutionNotes[id] || 'Resolved without notes.';
    resolveDispute(id, notes);
  };

  const handleNoteChange = (id, value) => {
    setResolutionNotes(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="dispute-page">
      <div className="page-header">
        <div>
          <h2>Dispute Resolution</h2>
          <p className="subtitle">Manage and resolve reported issues between generators and operators.</p>
        </div>
      </div>

      <div className="verification-tabs">
        {['Unresolved', 'Resolved'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="disputes-grid">
        {filteredDisputes.length === 0 ? (
          <div className="dashboard-card empty-state-card" style={{gridColumn: '1 / -1'}}>
            {activeTab === 'Unresolved' ? (
              <CheckCircle size={40} className="text-green" />
            ) : (
              <FileText size={40} className="text-gray" style={{opacity: 0.5}} />
            )}
            <h3>No {activeTab.toLowerCase()} disputes</h3>
            <p>{activeTab === 'Unresolved' ? 'All clear! Great job.' : 'No disputes have been resolved yet.'}</p>
          </div>
        ) : (
          filteredDisputes.map(dispute => (
            <div key={dispute.id} className={`dispute-card ${dispute.status === 'Resolved' ? 'resolved' : ''}`}>
              <div className="dispute-header">
                <div>
                  <h3 className="dispute-title">{dispute.id}</h3>
                  <div className="dispute-subtitle">Reported: {dispute.date}</div>
                </div>
                <span className={`status-badge ${dispute.status === 'Resolved' ? 'approved' : 'rejected'}`} style={{background: dispute.status === 'Resolved' ? '#dcfce7' : '#fef3c7', color: dispute.status === 'Resolved' ? '#16a34a' : '#d97706'}}>
                  {dispute.status}
                </span>
              </div>

              <div className="dispute-details">
                <p><FileText size={14} /> <strong>Job:</strong> {dispute.relatedJob}</p>
                <p><Building size={14} /> <strong>Generator:</strong> {dispute.generator}</p>
                <p><Truck size={14} /> <strong>Operator:</strong> {dispute.operator}</p>
              </div>

              <div>
                <strong>Reported Issue:</strong>
                <p className="dispute-issue">"{dispute.issue}"</p>
              </div>

              <div className="resolution-area">
                {dispute.status === 'Unresolved' ? (
                  <>
                    <textarea 
                      className="resolution-textarea"
                      placeholder="Add resolution notes..."
                      value={resolutionNotes[dispute.id] || ''}
                      onChange={(e) => handleNoteChange(dispute.id, e.target.value)}
                    ></textarea>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleResolve(dispute.id)}
                    >
                      <CheckCircle size={16} /> Mark as Resolved
                    </button>
                  </>
                ) : (
                  <div className="resolution-notes">
                    <strong>Resolution Notes:</strong>
                    <p style={{margin: '4px 0 0 0'}}>{dispute.notes}</p>
                    <div className="resolution-date">Resolved on: {dispute.resolvedAt}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DisputeResolution;
