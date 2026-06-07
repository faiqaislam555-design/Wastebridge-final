import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle  } from 'lucide-react';
import './LoginPage.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://wastebridge-backend.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid or expired link.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <h1>Invalid Link</h1>
            <p style={{ color: '#6b7280' }}>This password reset link is invalid.</p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '20px', display: 'block' }}>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px', display: 'inline-flex', padding: '16px', background: '#ecfdf5', borderRadius: '50%', color: '#059669' }}>
              <CheckCircle size={48} />
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Password Reset!</h1>
            <p style={{ color: '#6b7280' }}>Your password has been reset successfully.</p>
            <p style={{ color: '#6b7280' }}>Redirecting to login...</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', display: 'block' }}>
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
          <img src="/logo.png" alt="WasteBridge Logo" style={{ height: '32px', width: 'auto' }} />
          <span>WasteBridge</span>
        </Link>
        <div className="login-card">
          <div className="login-header">
            <h1>Set New Password</h1>
            <p>Enter your new password below.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              </div>
            </div>
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;