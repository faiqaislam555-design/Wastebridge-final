import StripePaymentModal from '../../components/StripePaymentModal';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  Wallet, 
  Download, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  X,
  Lock,
  Star,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PricingInvoices.css';

const PricingInvoices = () => {
  const { currentUser } = useAuth();
  const isOperator = currentUser?.role === 'operator';

  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripePaymentData, setStripePaymentData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pendingUpgradePlan, setPendingUpgradePlan] = useState(null);
  
  const [currentPlan, setCurrentPlan] = useState({
    name: isOperator ? 'Operator — Enterprise' : 'Generator — Standard',
    desc: isOperator ? 'Unlimited pickup listings, advanced analytics, priority support' : 'Up to 10 pickups/month, unlimited operator browsing, compliance reports included',
    price: isOperator ? '₨ 15,000' : '₨ 5,000'
  });

  const availablePlans = [
    { name: 'Generator — Basic', price: '₨ 2,500', desc: 'Up to 3 pickups/month, basic reporting, email support', icon: <Clock size={24} /> },
    { name: 'Generator — Standard', price: '₨ 5,000', desc: 'Up to 10 pickups/month, unlimited browsing, compliance reports', icon: <CheckCircle size={24} /> },
    { name: 'Generator — Premium', price: '₨ 12,000', desc: 'Unlimited pickups, priority matching, 24/7 dedicated support', icon: <Star size={24} /> },
  ];

  const [invoices, setInvoices] = useState([]);

useEffect(() => {
    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('wb_token');
            const res = await fetch('http://127.0.0.1:8000/api/invoices/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error('Failed to fetch invoices', err);
        }
    };
    fetchInvoices();
}, []);

  
const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

const totalBilledThisMonth = invoices
  .filter(inv => {
    const invDate = new Date(inv.date);
    const now = new Date();
    return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
  })
  .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

const outstandingBalance = invoices
  .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')
  .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

const nextUnpaidInvoice = invoices
  .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')
  .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

const nextDueDate = nextUnpaidInvoice?.date || 'No pending payments';
  const stats = isOperator ? [
  { label: 'Current Period', value: currentMonth, icon: <Calendar size={20} />, color: '#2563eb' },
  { label: 'Total Earned This Month', value: `₨ ${totalBilledThisMonth.toLocaleString()}`, icon: <ArrowUpRight size={20} />, color: '#16a34a' },
  { label: 'Pending Payouts', value: `₨ ${outstandingBalance.toLocaleString()}`, icon: <Wallet size={20} />, color: '#d97706', alert: outstandingBalance > 0 },
  { label: 'Next Payout Date', value: nextDueDate, icon: <Clock size={20} />, color: '#4b5563' },
] : [
  { label: 'Current Period', value: currentMonth, icon: <Calendar size={20} />, color: '#2563eb' },
  { label: 'Total Billed This Month', value: `₨ ${totalBilledThisMonth.toLocaleString()}`, icon: <ArrowUpRight size={20} />, color: '#16a34a' },
  { label: 'Outstanding Balance', value: `₨ ${outstandingBalance.toLocaleString()}`, icon: <Wallet size={20} />, color: '#d97706', alert: outstandingBalance > 0 },
  { label: 'Next Payment Due', value: nextDueDate, icon: <Clock size={20} />, color: '#4b5563' },
];

  const filteredInvoices = filterStatus === 'All' 
    ? invoices 
    : invoices.filter(inv => inv.status === filterStatus);

  const openPaymentModal = (invoice) => {
  const numericAmount = typeof invoice.amount === 'string'
    ? parseInt(invoice.amount.replace(/[^0-9]/g, ''))
    : Math.round(invoice.amount);  // ← handles float from backend
  setStripePaymentData({
    amount: numericAmount,
    description: `Paying Invoice ${invoice.id}`,
    invoiceId: invoice.id,
  });
  setSelectedInvoice(invoice);
  setShowStripeModal(true);
};

  const handleSelectUpgrade = (plan) => {
    setPendingUpgradePlan(plan);
    setSelectedInvoice(null);
    setShowUpgradeModal(false);
    setShowModal(true);
  };

  const handlePaymentConfirmation = () => {
    if (pendingUpgradePlan) {
      setCurrentPlan(pendingUpgradePlan);
      alert(`Plan Upgraded! Successfully moved to ${pendingUpgradePlan.name}.`);
    } else if (selectedInvoice) {
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv
      ));
      alert('Payment Confirmed! Your invoice has been marked as Paid.');
    }
    setShowModal(false);
    setPendingUpgradePlan(null);
    setSelectedInvoice(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Unpaid': return 'status-unpaid';
      case 'Overdue': return 'status-overdue';
      default: return '';
    }
  };
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('wb_token');
      const res = await fetch('http://127.0.0.1:8000/api/invoices/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);  // ← add this
    }
  };
  fetchInvoices();
}, []);
  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Pricing & Invoices</h1>
      </div>

      {/* SECTION 1: STAT CARDS */}
      <div className="billing-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="billing-stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className={`stat-value ${stat.alert ? 'alert-text' : ''}`}>
                              {loading ? '...' : stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: ACTIVE PLAN */}
      <div className="active-plan-card">
        <div className="plan-main">
          <div className="plan-badge">CURRENT PLAN</div>
          <div className="plan-details">
            <div className="plan-name-row">
              <h3>{currentPlan.name}</h3>
              <span className="plan-status">Active</span>
            </div>
            <p className="plan-desc">{currentPlan.desc}</p>
          </div>
        </div>
        <div className="plan-pricing">
          <div className="price-tag">
            <span className="amount">{currentPlan.price}</span>
            <span className="period">/ month</span>
          </div>
          <button className="upgrade-btn" onClick={() => setShowUpgradeModal(true)}>Upgrade Plan</button>
        </div>
      </div>

      {/* SECTION 3: INVOICE TABLE */}
      <div className="invoice-history-card">
        <div className="invoice-header">
          <h2>Invoice History</h2>
          <div className="invoice-filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-select"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <input type="month" className="date-picker" defaultValue="2026-04" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="inv-id">{inv.id}</td>
                  <td>{inv.date}</td>
                  <td className="inv-desc">{inv.desc}</td>
                  <td className="inv-amount">{inv.amount}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-group">
                      <button className="download-icon-btn" title="Download Invoice">
                        <Download size={16} />
                      </button>
                      {(inv.status === 'Unpaid' || inv.status === 'Overdue') && (
                        <button 
                          className="pay-now-btn"
                          onClick={() => openPaymentModal(inv)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="billing-footer">
        <p>Need help with billing? <Link to="/shared/support" className="support-link">Contact Support</Link></p>
      </div>

      {/* PAYMENT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Secure Payment</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="invoice-summary">
                {pendingUpgradePlan ? (
                  <>
                    <span>Upgrading to {pendingUpgradePlan.name}</span>
                    <span className="modal-amount">{pendingUpgradePlan.price}</span>
                  </>
                ) : (
                  <>
                    <span>Paying Invoice {selectedInvoice?.id}</span>
                    <span className="modal-amount">{selectedInvoice?.amount}</span>
                  </>
                )}
              </div>

              <form className="payment-form" onSubmit={(e) => { 
                e.preventDefault(); 
                handlePaymentConfirmation();
              }}>
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="input-with-icon">
                    <CreditCard size={18} />
                    <input type="text" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>

                <div className="secure-notice">
                  <Lock size={14} />
                  <span>Your payment is encrypted and secure</span>
                </div>

                <button type="submit" className="confirm-payment-btn">
                  Confirm Payment
                </button>
                <button type="button" className="cancel-link" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* UPGRADE PLAN MODAL */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Choose Your Plan</h2>
              <button className="close-modal" onClick={() => setShowUpgradeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="plans-grid">
                {availablePlans.map((plan) => (
                  <div 
                    key={plan.name} 
                    className={`plan-option-card ${currentPlan.name === plan.name ? 'current' : ''}`}
                  >
                    <div className="plan-option-header">
                      <div className="plan-option-icon">{plan.icon}</div>
                      {currentPlan.name === plan.name && <span className="current-badge">Active</span>}
                    </div>
                    <h3>{plan.name}</h3>
                    <div className="plan-option-price">{plan.price}<span>/mo</span></div>
                    <p>{plan.desc}</p>
                    <button 
                      className={`select-plan-btn ${currentPlan.name === plan.name ? 'disabled' : ''}`}
                      disabled={currentPlan.name === plan.name}
                      onClick={() => handleSelectUpgrade(plan)}
                    >
                      {currentPlan.name === plan.name ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showStripeModal && stripePaymentData && (
        <StripePaymentModal
         amount={stripePaymentData.amount}
         description={stripePaymentData.description}
         invoiceId={stripePaymentData.invoiceId}
         onSuccess={async (paymentIntentId) => {
    const token = localStorage.getItem('wb_token');
    await fetch('http://127.0.0.1:8000/api/invoices/mark-paid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            invoice_number: selectedInvoice?.id?.replace('#', ''),
            payment_intent_id: paymentIntentId
        })
    });
    setInvoices(invoices.map(inv =>
        inv.id === selectedInvoice?.id ? { ...inv, status: 'Paid' } : inv
    ));
    setShowStripeModal(false);

        }}
        onClose={() => setShowStripeModal(false)}
    />
)}
    </div>

  );
};

export default PricingInvoices;
