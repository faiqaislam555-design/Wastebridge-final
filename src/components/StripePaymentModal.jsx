/**
 * StripePaymentModal.jsx
 * -------------------------
 * Real Stripe payment modal for WasteBridge.
 * Uses Stripe.js to securely collect card details.
 *
 * Usage:
 *   <StripePaymentModal
 *     amount={4800}
 *     description="Invoice #1042"
 *     invoiceId="#1042"
 *     onSuccess={(paymentIntentId) => { ... }}
 *     onClose={() => { ... }}
 *   />
 */

import { useState, useEffect, useRef } from 'react';
import { Lock, X, CreditCard, CheckCircle } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const StripePaymentModal = ({ amount, description, invoiceId, onSuccess, onClose }) => {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const cardRef = useRef(null);

  const token = localStorage.getItem('wb_token') ||
              localStorage.getItem('token') || 
              localStorage.getItem('access_token') ||
              sessionStorage.getItem('token');
  // ── Step 1: Load Stripe.js ─────────────────────────────────────────────────
  useEffect(() => {
    const loadStripe = async () => {
      try {
        // Get publishable key from backend
        const res = await fetch(`${API_BASE}/api/payments/publishable-key`);
        const { publishable_key } = await res.json();

        // Load Stripe.js dynamically
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
          const stripeInstance = window.Stripe(publishable_key);
          setStripe(stripeInstance);
        };
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to load payment system. Please try again.');
        setLoading(false);
      }
    };
    loadStripe();
  }, []);

  // ── Step 2: Create PaymentIntent ───────────────────────────────────────────
  useEffect(() => {
    if (!stripe) return;

    const createIntent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amount,
            currency: "usd",   
            description: description,
            invoice_id: invoiceId,
          }),
        });

        if (!res.ok) throw new Error('Failed to create payment');
        const data = await res.json();
        setClientSecret(data.client_secret);
        setPaymentIntentId(data.payment_intent_id);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [stripe]);

  // ── Step 3: Mount Stripe Card Element ──────────────────────────────────────
  useEffect(() => {
    if (!stripe || !clientSecret || !cardRef.current) return;

    const elementsInstance = stripe.elements({ clientSecret });
    const cardElement = elementsInstance.create('payment');
    cardElement.mount(cardRef.current);
    setElements(elementsInstance);
  }, [stripe, clientSecret]);

  // ── Step 4: Handle Payment Submission ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Verify with backend
      const res = await fetch(`${API_BASE}/api/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          invoice_id: invoiceId,
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(paymentIntentId);
        }, 2000);
      } else {
        setError(`Payment failed: ${data.message}`);
      }

    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Secure Payment</h2>
          <button style={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {/* Success State */}
        {success ? (
          <div style={styles.successBox}>
            <CheckCircle size={48} color="#16a34a" />
            <h3 style={{ color: '#16a34a', margin: '12px 0 4px' }}>Payment Successful!</h3>
            <p style={{ color: '#6b7280' }}>Your payment has been confirmed.</p>
          </div>
        ) : (
          <div style={styles.body}>

            {/* Invoice Summary */}
            <div style={styles.summary}>
              <span style={{ color: '#6b7280' }}>{description}</span>
              <span style={styles.amount}>PKR {amount?.toLocaleString()}</span>
            </div>

            {/* Loading */}
            {loading && (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#6b7280', marginTop: '12px' }}>Loading payment form...</p>
              </div>
            )}

            {/* Stripe Card Element */}
            {!loading && (
              <form onSubmit={handleSubmit}>
                <div style={styles.cardContainer}>
                  <div ref={cardRef} style={styles.cardElement} />
                </div>

                {error && (
                  <div style={styles.errorBox}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={styles.secureNotice}>
                  <Lock size={14} color="#6b7280" />
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    Your payment is encrypted and secure
                  </span>
                </div>

                {/* Test Card Hint */}
                <div style={styles.testHint}>
                  🧪 Test card: <strong>4242 4242 4242 4242</strong> | Any future date | Any CVV
                </div>

                <button
                  type="submit"
                  disabled={processing || loading}
                  style={{
                    ...styles.payBtn,
                    opacity: processing ? 0.7 : 1,
                    cursor: processing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {processing ? 'Processing...' : `Pay PKR ${amount?.toLocaleString()}`}
                </button>

                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '90vh',        // ← add this
    overflowY: 'auto',        // ← add this (removes 'overflow: hidden')
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
   header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: { margin: 0, fontSize: '18px', fontWeight: '600' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#6b7280', padding: '4px',
  },
  body: { padding: '24px' },
  summary: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#f9fafb', borderRadius: '8px',
    padding: '14px 16px', marginBottom: '20px',
  },
  amount: { fontWeight: '700', fontSize: '18px', color: '#2d6a4f' },
  cardContainer: { marginBottom: '16px' },
  cardElement: {
    border: '1px solid #d1d5db', borderRadius: '8px',
    padding: '14px', minHeight: '44px',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '12px',
    color: '#dc2626', fontSize: '14px', marginBottom: '12px',
  },
  secureNotice: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginBottom: '8px',
  },
  testHint: {
    background: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: '6px', padding: '10px 12px',
    fontSize: '13px', color: '#92400e', marginBottom: '16px',
  },
  payBtn: {
    width: '100%', padding: '14px',
    background: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '600',
    marginBottom: '10px',
  },
  cancelBtn: {
    width: '100%', padding: '10px',
    background: 'none', border: 'none',
    color: '#6b7280', cursor: 'pointer',
    fontSize: '14px',
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '40px 0',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #2d6a4f',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  successBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '40px 24px',
    textAlign: 'center',
  },
};

export default StripePaymentModal;
