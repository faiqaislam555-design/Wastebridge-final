import { useState } from 'react';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Info,
  ChevronRight,
  ExternalLink,
  X,
  CheckCircle,
  CreditCard, 
  Calendar
} from 'lucide-react';
import './SupportHelp.css';

const SupportHelp = () => {
  const [showManual, setShowManual] = useState(false);
  const helpArticles = [
    { title: 'Payment & Billing Issues', icon: <CreditCard size={20} /> },
    { title: 'Account Verification', icon: <ShieldCheck size={20} /> },
    { title: 'Waste Pickup Scheduling', icon: <Calendar size={20} /> },
    { title: 'Compliance & Reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="support-page">
      <div className="support-hero">
        <h1>How can we help you?</h1>
        <p>Search our knowledge base or get in touch with our support team.</p>
        <div className="support-search">
          <input type="text" placeholder="Search for help topics..." />
          <button>Search</button>
        </div>
      </div>

      <div className="support-content-grid">
        <div className="support-main">
          <section className="document-section">
            <div className="section-header">
              <Info size={24} />
              <h2>Essential Information regarding concerns</h2>
            </div>
            
            <div className="document-card">
              <div className="doc-item">
                <h3>1. Billing & Payment Concerns</h3>
                <p>
                  All payments are processed securely through our encrypted gateway. If you encounter a payment failure, 
                  please ensure your card details are correct and you have sufficient funds. 
                  Invoices are generated automatically after each confirmed pickup.
                </p>
              </div>

              <div className="doc-item">
                <h3>2. Compliance & Legal Documentation</h3>
                <p>
                  WasteBridge ensures all waste disposal activities comply with local environmental regulations. 
                  Digital certificates are issued within 24-48 hours of waste disposal at a certified facility. 
                  You can download these from the "Document Vault" at any time.
                </p>
              </div>

              <div className="doc-item">
                <h3>3. Service Quality & Disputes</h3>
                <p>
                  If a pickup is delayed or the service quality is not as expected, please use the "Ratings & Reviews" 
                  section to provide feedback. For urgent disputes regarding weight discrepancies or safety concerns, 
                  please open a support ticket immediately.
                </p>
              </div>

              <div className="doc-item">
                <h3>4. Data Privacy & Security</h3>
                <p>
                  Your business data and pickup history are strictly confidential. We employ industry-standard encryption 
                  to protect your sensitive information. Access is only granted to authorized operators for the 
                  purpose of service fulfillment.
                </p>
              </div>
            </div>
          </section>

          <section className="faq-preview">
            <h3>Popular Help Articles</h3>
            <div className="article-links">
              <div className="article-link">
                <span>How to request a hazardous waste pickup?</span>
                <ChevronRight size={16} />
              </div>
              <div className="article-link">
                <span>Updating your company profile information</span>
                <ChevronRight size={16} />
              </div>
              <div className="article-link">
                <span>Understanding your quarterly compliance report</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </section>
        </div>

        <aside className="support-sidebar">
          <div className="contact-card">
            <h3>Contact Support</h3>
            <p>Our team is available Mon-Fri, 9am - 6pm PKT.</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <Mail size={18} />
                <div>
                  <span>Email</span>
                  <strong>support@wastebridge.pk</strong>
                </div>
              </div>
              <div className="contact-method">
                <Phone size={18} />
                <div>
                  <span>Phone</span>
                  <strong>+92 300 1234567</strong>
                </div>
              </div>
              <div className="contact-method">
                <MessageSquare size={18} />
                <div>
                  <span>Live Chat</span>
                  <strong>Start Conversation</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="help-box">
            <h4>Need immediate help?</h4>
            <p>Check out our user manual for step-by-step guides.</p>
            <button className="manual-btn" onClick={() => setShowManual(true)}>
              <FileText size={16} /> View User Manual
            </button>
          </div>
        </aside>
      </div>

      {/* USER MANUAL MODAL */}
      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="manual-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-title-group">
                <FileText size={24} className="text-green" />
                <h2>WasteBridge User Manual</h2>
              </div>
              <button className="close-modal" onClick={() => setShowManual(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body manual-content">
              <section className="manual-section">
                <h3><CheckCircle size={18} /> Getting Started</h3>
                <p>Welcome to WasteBridge! To begin, ensure your profile is fully completed and verified. You can manage your profile from the dashboard.</p>
              </section>

              <section className="manual-section">
                <h3><CheckCircle size={18} /> Logging Waste</h3>
                <p>Click on "Log Waste" to record new waste types. You will need to specify the category, weight, and current storage location.</p>
              </section>

              <section className="manual-section">
                <h3><CheckCircle size={18} /> Booking a Pickup</h3>
                <p>Browse available operators in your area. You can filter by rating, price, and specialized waste handling. Once selected, choose a preferred date and time.</p>
              </section>

              <section className="manual-section">
                <h3><CheckCircle size={18} /> Managing Invoices</h3>
                <p>Visit the "Pricing & Invoices" page to view pending payments. Use the "Pay Now" button for instant settlement via secure credit card processing.</p>
              </section>

              <div className="manual-footer-note">
                <p>For more detailed technical documentation, please contact our system administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportHelp;
