import { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Save,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PortalSettings.css';

const PortalSettings = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: <User size={18} /> },
    { id: 'security', label: 'Security & Password', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notification Settings', icon: <Bell size={18} /> },
    { id: 'preferences', label: 'System Preferences', icon: <Globe size={18} /> },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Portal Settings</h1>
        <p>Manage your account settings and portal preferences.</p>
      </div>

      <div className="settings-container">
        {/* SIDEBAR TABS */}
        <aside className="settings-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <ChevronRight size={16} className="chevron" />
            </button>
          ))}
        </aside>

        {/* CONTENT AREA */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p className="section-desc">Update your personal details and how others see you on the portal.</p>
              
              <div className="profile-upload">
                <div className="avatar-large" style={{ background: '#16a34a' }}>
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="upload-actions">
                  <button className="change-btn">Change Photo</button>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} />
                      <input type="text" defaultValue={currentUser?.name || "WasteBridge User"} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} />
                      <input type="email" defaultValue={currentUser?.role === 'operator' ? 'contact@operator.pk' : 'user@generator.pk'} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} />
                      <input type="text" defaultValue="+92 300 1234567" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-wrapper">
                      <MapPin size={18} />
                      <input type="text" defaultValue="Lahore, Pakistan" />
                    </div>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>{currentUser?.role === 'operator' ? 'Company Description' : 'Bio / Personal Statement'}</label>
                  <textarea defaultValue={currentUser?.role === 'operator' ? "Leading waste disposal specialist focused on organic recycling and biogas production." : "Dedicated waste generator committed to reducing environmental impact through smart disposal."}></textarea>
                </div>
                <button type="button" className="save-btn" onClick={() => alert('Profile updated successfully!')}>
                  <Save size={18} /> Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-desc">Keep your account secure by updating your password and enabling protection.</p>

              <div className="security-card warning">
                <Shield size={20} />
                <div>
                  <strong>Two-Factor Authentication</strong>
                  <p>Enhance your security by requiring a code in addition to your password.</p>
                </div>
                <button className="setup-btn">Setup 2FA</button>
              </div>

              <form className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                    <button className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} />
                      <input type="password" placeholder="New Password" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} />
                      <input type="password" placeholder="Confirm Password" />
                    </div>
                  </div>
                </div>
                <button type="button" className="save-btn" onClick={() => alert('Password updated successfully!')}>
                   Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-desc">Choose which notifications you want to receive and where.</p>

              <div className="notification-list">
                {[
                  { id: 'n1', title: 'Pickup Confirmations', desc: 'Notify me when an operator confirms a waste pickup request.' },
                  { id: 'n2', title: 'Invoice & Payments', desc: 'Receive alerts for new invoices and payment receipts.' },
                  { id: 'n3', title: 'Compliance Alerts', desc: 'Get notified when new compliance reports or certificates are ready.' },
                  { id: 'n4', title: 'Security Alerts', desc: 'Important alerts regarding your account security and login activity.' },
                ].map(item => (
                  <div key={item.id} className="notification-toggle-item">
                    <div className="toggle-info">
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>System Preferences</h2>
              <p className="section-desc">Customize your portal experience with theme and regional settings.</p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Portal Language</label>
                  <select defaultValue="en">
                    <option value="en">English (US)</option>
                    <option value="ur">Urdu (اردو)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Zone</label>
                  <select defaultValue="pkt">
                    <option value="pkt">Pakistan Standard Time (PKT)</option>
                    <option value="utc">UTC / GMT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Theme Mode</label>
                  <div className="theme-selector">
                    <button className="theme-btn active">Light</button>
                    <button className="theme-btn">Dark</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalSettings;
