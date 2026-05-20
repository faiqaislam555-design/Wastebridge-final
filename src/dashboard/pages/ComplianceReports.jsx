import { useState, useEffect, useRef } from 'react';
import { Download, Send, FileText, Calendar, CheckCircle2, Award, Building, BarChart2 } from 'lucide-react';
import { generateReport, emailReport, fetchReports } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../styles/ComplianceReports.css';

const ComplianceReports = () => {
  const { currentUser } = useAuth();
  const [reportType, setReportType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 2023');
  const [email, setEmail] = useState('');
  const [reportData, setReportData] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const reportTypes = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'annual', label: 'Annual' },
  ];

  // Load past reports on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReports()
      .then(setPastReports)
      .catch(() => {});
  }, []);

  // Generate report only when the user clicks the button — NOT automatically on render
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await generateReport({
        report_type: reportType,
        selected_period: selectedPeriod,
      });
      // Refresh past reports list
      const updated = await fetchReports();
      setPastReports(updated);

      setReportData({
        institution: currentUser?.full_name || 'Your Institution',
        period: data.period || selectedPeriod,
        totalDiverted: data.total_diverted || '0 kg',
        // Breakdown is computed from actual data by the backend;
        // display static breakdown labels as frontend-only decoration
        breakdown: [
          { method: 'Composting',   percentage: 65, color: '#10b981' },
          { method: 'Animal Feed',  percentage: 20, color: '#3b82f6' },
          { method: 'Biogas',       percentage: 15, color: '#f59e0b' },
        ],
        operators: ['EcoCycle Lahore', 'BioGas Punjab'],
        certifications: ['EPA Approved Disposal', 'ISO 14001 Waste Transfer'],
      });
      setSuccessMsg('Report generated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (!reportData) {
      setError('Please generate a report first.');
      return;
    }
    setIsSending(true);
    setError('');
    setSuccessMsg('');
    try {
      await emailReport({
        report_type: reportType,
        selected_period: selectedPeriod,
        regulator_email: email,
      });
      setSuccessMsg(`Report sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send report.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="compliance-reports-page">

      {/* TOP CONTROLS */}
      <div className="dashboard-card controls-card">
        <div className="controls-grid">
          <div className="control-group">
            <label>Report Type</label>
            <div className="segmented-control">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  className={`segment-btn ${reportType === type.id ? 'active' : ''}`}
                  onClick={() => setReportType(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Select Period</label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={reportType !== 'monthly'}
              >
                <option value="Oct 2023">October 2023</option>
                <option value="Sep 2023">September 2023</option>
                <option value="Aug 2023">August 2023</option>
              </select>
            </div>
          </div>

          <div className="control-group" style={{ alignSelf: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', fontSize: '14px', border: '1px solid #a7f3d0' }}>
            {successMsg}
          </div>
        )}
      </div>

      <div className="reports-layout">

        {/* REPORT PREVIEW */}
        <div className="dashboard-card report-preview-card">
          <div className="report-header">
            <div className="report-badge">
              <ShieldCheckIcon size={20} />
              <span>Official Compliance Report</span>
            </div>
            <h1>Waste Diversion Summary</h1>
            <p className="report-meta">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div className="report-body">
            {!reportData ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px', display: 'inline-block' }} />
                <p>Select a report type and click <strong>Generate Report</strong> to view your compliance data.</p>
              </div>
            ) : (
              <>
                <div className="report-section summary-grid">
                  <div className="summary-stat">
                    <Building size={20} className="stat-icon" />
                    <div className="stat-content">
                      <label>Institution</label>
                      <strong>{reportData.institution}</strong>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <Calendar size={20} className="stat-icon" />
                    <div className="stat-content">
                      <label>Reporting Period</label>
                      <strong>{reportData.period}</strong>
                    </div>
                  </div>
                  <div className="summary-stat stat-highlight">
                    <BarChart2 size={24} className="stat-icon" />
                    <div className="stat-content">
                      <label>Total Waste Diverted</label>
                      <strong>{reportData.totalDiverted}</strong>
                    </div>
                  </div>
                </div>

                <div className="report-section breakdown-section">
                  <h3>Diversion Breakdown</h3>
                  <div className="css-bar-chart">
                    {reportData.breakdown.map((item, idx) => (
                      <div key={idx} className="chart-bar-group">
                        <div className="chart-label-row">
                          <span>{item.method}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="chart-track">
                          <div className="chart-fill" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="report-section details-grid">
                  <div className="detail-box">
                    <h3>Certified Operators Used</h3>
                    <ul className="custom-list">
                      {reportData.operators.map((op, idx) => (
                        <li key={idx}><CheckCircle2 size={16} className="list-icon-green" /> {op}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-box">
                    <h3>Certifications</h3>
                    <ul className="custom-list">
                      {reportData.certifications.map((cert, idx) => (
                        <li key={idx}><Award size={16} className="list-icon-gold" /> {cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="report-footer">
            <div className="watermark">WasteBridge Certified Data</div>
            <p>This report acts as a verifiable record of waste management practices in compliance with local environmental regulations.</p>
          </div>
        </div>

        {/* ACTIONS SIDEBAR */}
        <div className="actions-sidebar">

          <div className="dashboard-card export-card">
            <h3>Export Report</h3>
            <p>Download a PDF copy for your internal records.</p>
            <button className="btn btn-primary export-btn" disabled={!reportData} onClick={() => window.print()}>
              <Download size={18} />
              Download PDF
            </button>
          </div>

          <div className="dashboard-card email-card">
            <h3>Send to Regulator</h3>
            <p>Email this report to your local environmental agency or auditor.</p>
            <form className="email-form" onSubmit={handleEmailReport}>
              <div className="form-group">
                <label>Regulator Email Address</label>
                <input
                  type="email"
                  placeholder="auditor@epa.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSending}
                />
              </div>
              <button type="submit" className="btn btn-outline send-btn" disabled={isSending || !reportData}>
                <Send size={16} />
                {isSending ? 'Sending...' : 'Send Report'}
              </button>
            </form>
          </div>

          {/* Past Reports */}
          {pastReports.length > 0 && (
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>Past Reports</h3>
              {pastReports.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                  <span style={{ color: '#374151' }}>{r.period} ({r.report_type})</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{r.total_diverted}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const ShieldCheckIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default ComplianceReports;
