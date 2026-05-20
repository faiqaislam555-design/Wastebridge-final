import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './LoginPage.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px', display: 'inline-flex', padding: '16px', background: '#ecfdf5', borderRadius: '50%', color: '#059669' }}>
              <CheckCircle size={48} />
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Check your email</h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              We've sent a password reset link to <br /><strong>{email}</strong>
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'block' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="hero__grid-overlay" aria-hidden="true"></div>
      <div className="login-container">
        <Link to="/" className="login-logo">
          <img src="/logo.png" alt="WasteBridge Logo" style={{height: '32px', width: 'auto', objectFit: 'contain'}} />
          <span>WasteBridge</span>
        </Link>
        <div className="login-card">
          <div className="login-header">
            <h1>Reset password</h1>
            <p>Enter your email and we'll send you a link to reset your password.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              </div>
            </div>
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          <div className="login-footer" style={{ marginTop: '24px' }}>
            <Link to="/login" className="register-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;