import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import './LoginPage.css'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('generator');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tokenData = await loginUser(email, password);
      login(tokenData);

      const userRole = tokenData.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'operator') navigate('/operator/dashboard');
      else navigate('/generator/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Background (matches Hero) */}
      <div className="hero__grid-overlay" aria-hidden="true"></div>
      <div className="hero__glow hero__glow--1" aria-hidden="true"></div>
      <div className="hero__glow hero__glow--2" aria-hidden="true"></div>

      <div className="login-container">
        {/* Logo */}
        <Link to="/" className="login-logo">
          <img src="/logo.png" alt="WasteBridge Logo" style={{height: '32px', width: 'auto', objectFit: 'contain'}} />
          <span>WasteBridge</span>
        </Link>

        {/* Card */}
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your WasteBridge account</p>
          </div>

          <div className="role-selector">
            {/* Generator Tile */}
            <div 
              className={`role-tile ${role === 'generator' ? 'role-tile--active' : ''}`}
              onClick={() => setRole('generator')}
            >
              <Building className="role-icon" size={24} />
              <span>Generator</span>
              {role === 'generator' && (
                <div className="role-badge-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                </div>
              )}
            </div>

            {/* Operator Tile */}
            <div 
              className={`role-tile ${role === 'operator' ? 'role-tile--active' : ''}`}
              onClick={() => setRole('operator')}
            >
              <Truck className="role-icon" size={24} />
              <span>Operator</span>
              {role === 'operator' && (
                <div className="role-badge-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                </div>
              )}
            </div>
          </div>

          {error && <div className="login-error" style={{color:'#ef4444',background:'#fef2f2',padding:'10px 14px',borderRadius:'8px',fontSize:'14px',marginBottom:'12px',border:'1px solid #fecaca'}}>{error}</div>}

          <form className="login-form" onSubmit={handleLogin}>
            
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
              </div>
              <div className="input-with-icon">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register" className="register-link">Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
