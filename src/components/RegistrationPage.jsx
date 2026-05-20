import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building, Truck, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { registerGenerator, registerOperator } from '../services/api'
import './RegistrationPage.css'

const RegistrationPage = () => {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'operator' ? 'operator' : 'generator'
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState(initialRole)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [services, setServices] = useState([])

  // New controlled state for all form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [citiesServed, setCitiesServed] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleService = (service) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service))
    } else {
      setServices([...services, service])
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      let tokenData;
      if (role === 'generator') {
        tokenData = await registerGenerator({
          full_name: fullName,
          email,
          password,
          confirm_password: confirmPassword,
          institution_type: institutionType,
          city,
          phone_number: phoneNumber,
        });
      } else {
        tokenData = await registerOperator({
          full_name: fullName,
          email,
          password,
          confirm_password: confirmPassword,
          company_name: companyName,
          license_number: licenseNumber,
          service_types: services,
          cities_served: citiesServed,
        });
      }

      // Auto-login after registration
      login(tokenData);

      if (tokenData.role === 'operator') navigate('/operator/dashboard');
      else navigate('/generator/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Decorative Background (matches Hero) */}
      <div className="hero__grid-overlay" aria-hidden="true"></div>
      <div className="hero__glow hero__glow--1" aria-hidden="true"></div>
      <div className="hero__glow hero__glow--2" aria-hidden="true"></div>

      <div className="register-container">
        {/* Logo */}
        <Link to="/" className="register-logo">
          <img src="/logo.png" alt="WasteBridge Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span>WasteBridge</span>
        </Link>

        {/* Card */}
        <div className="register-card">
          <div className="register-header">
            <h1>Create your account</h1>
            <p>Join the sustainable waste network</p>
          </div>

          {error && <div className="register-error" style={{color:'#ef4444',background:'#fef2f2',padding:'10px 14px',borderRadius:'8px',fontSize:'14px',marginBottom:'12px',border:'1px solid #fecaca'}}>{error}</div>}

          <form className="register-form" onSubmit={handleRegister}>

            {/* Role Selector */}
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                  </div>
                )}
              </div>

            </div>

            <div className="divider">
              <span>Your details</span>
            </div>

            {/* Common Fields */}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
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
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm</label>
                <div className="input-with-icon">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional Fields */}
            <div className="conditional-fields">
              {role === 'generator' && (
                <div className="fields-generator">
                  <div className="form-group">
                    <label>Institution Type</label>
                    <select required value={institutionType} onChange={(e) => setInstitutionType(e.target.value)}>
                      <option value="" disabled>Select type</option>
                      <option value="school">School / College</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="bakery">Bakery / Cafe</option>
                      <option value="corporate">Corporate Office</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" placeholder="e.g. Lahore" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+92" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}
              {role === 'operator' && (
                <div className="fields-operator">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" placeholder="Green Dispose Pvt Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>License Number</label>
                    <input type="text" placeholder="CPCB/SWM/2026/..." value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Service Type</label>
                    <div className="pill-group">
                      {['Composting', 'Biogas', 'Animal Feed', 'Landfill Alternative'].map(service => (
                        <button
                          key={service}
                          type="button"
                          className={`pill ${services.includes(service) ? 'pill--active' : ''}`}
                          onClick={() => toggleService(service)}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cities Served (Comma separated)</label>
                    <input type="text" placeholder="e.g. Lahore, Islamabad" value={citiesServed} onChange={(e) => setCitiesServed(e.target.value)} required />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
