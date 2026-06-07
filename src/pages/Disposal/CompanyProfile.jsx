import { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, FileCheck, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '', about: '', email: '', phone: '',
    location: '', licenses: '',
    pricing_model: 'per_kg', pricing_value: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('wb_token');
        const res = await fetch('https://wastebridge-backend.onrender.com/api/operator/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setForm({
            name: data.company_name || '',
            about: data.about || '',
            email: currentUser?.email || '',
            phone: data.phone || '',
            location: data.cities_served || '',
            licenses: data.license_number || '',
            pricing_model: data.pricing_model || 'per_kg',
            pricing_value: data.pricing_value || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('wb_token');
      await fetch('https://wastebridge-backend.onrender.com/api/operator/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: form.name,
          about: form.about,
          phone: form.phone,
          cities_served: form.location,
          license_number: form.licenses,
          pricing_model: form.pricing_model,
          pricing_value: form.pricing_value,
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const memberSince = profile?.updated_at
    ? new Date(currentUser?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  const initials = form.name
    ? form.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'OP';

  const pricingLabel = () => {
    if (!form.pricing_value) return '—';
    switch (form.pricing_model) {
      case 'per_kg': return `₨ ${form.pricing_value}/kg`;
      case 'flat': return `₨ ${form.pricing_value} flat`;
      case 'pays': return `Pays you ₨ ${form.pricing_value}/kg`;
      default: return form.pricing_value;
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>Loading profile...</div>;

  return (
    <div className="company-profile-page">
      <div className="page-header">
        <div>
          <h2>Company Profile</h2>
          <p className="subtitle">Manage your public information, contact details, and licenses.</p>
        </div>
        <button className="btn btn-primary btn-sm save-main-btn" onClick={handleSubmit}>
          <Save size={16} />
          {isSaved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="profile-layout">
        <form className="profile-form-grid" onSubmit={handleSubmit}>

          {/* Section 1: Basic Details */}
          <div className="dashboard-card form-section">
            <div className="form-section-header">
              <Building2 size={20} className="text-green" />
              <h3>Company Details</h3>
            </div>
            <div className="form-group full-width">
              <label>Company Name</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} className="basic-input" required />
            </div>
            <div className="form-group full-width">
              <label>About Us / Description</label>
              <textarea name="about" value={form.about}
                onChange={handleChange} className="basic-input" rows="4" />
            </div>
          </div>

          {/* Section 2: Contact */}
          <div className="dashboard-card form-section">
            <div className="form-section-header">
              <Phone size={20} className="text-green" />
              <h3>Contact Information</h3>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} className="basic-input" required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input type="tel" name="phone" value={form.phone}
                    onChange={handleChange} className="basic-input" required />
                </div>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Cities Served</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input type="text" name="location" value={form.location}
                  onChange={handleChange} className="basic-input" required />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="dashboard-card form-section">
            <div className="form-section-header">
              <Tag size={20} className="text-green" />
              <h3>Pricing</h3>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Pricing Model</label>
                <select name="pricing_model" value={form.pricing_model}
                  onChange={handleChange} className="basic-input">
                  <option value="per_kg">Charge per kg</option>
                  <option value="flat">Flat monthly fee</option>
                  <option value="pays">We pay the generator</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {form.pricing_model === 'per_kg' && 'Rate (₨ per kg)'}
                  {form.pricing_model === 'flat' && 'Monthly Fee (₨)'}
                  {form.pricing_model === 'pays' && 'We pay (₨ per kg)'}
                </label>
                <input type="number" name="pricing_value" value={form.pricing_value}
                  onChange={handleChange} className="basic-input"
                  placeholder="e.g. 8" min="0" />
              </div>
            </div>
            <div className="license-info-note">
              Current pricing shown to generators: <strong>{pricingLabel()}</strong>
            </div>
          </div>

          {/* Section 4: Licenses */}
          <div className="dashboard-card form-section">
            <div className="form-section-header">
              <ShieldCheck size={20} className="text-green" />
              <h3>Licenses & Certifications</h3>
            </div>
            <div className="form-group full-width">
              <label>License Number</label>
              <div className="input-with-icon">
                <FileCheck size={16} />
                <input type="text" name="licenses" value={form.licenses}
                  onChange={handleChange} className="basic-input"
                  placeholder="e.g. EPA-PB-2024-001" />
              </div>
            </div>
            <div className="license-info-note">
              Updating licenses may require verification by WasteBridge admins.
            </div>
          </div>

        </form>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="dashboard-card status-card">
            <div className="status-avatar-lg">{initials}</div>
            <h3>{form.name || 'Your Company'}</h3>
            <span className="status-badge status-active">Verified Partner</span>
            <div className="status-details">
              <div className="status-row">
                <span>Member Since</span>
                <strong>
                  {currentUser?.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '—'}
                </strong>
              </div>
              <div className="status-row">
                <span>Pricing</span>
                <strong className="text-green">{pricingLabel()}</strong>
              </div>
              <div className="status-row">
                <span>Verification</span>
                <strong className="text-green">Level 2</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;