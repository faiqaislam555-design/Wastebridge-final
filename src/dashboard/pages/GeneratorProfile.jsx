import { useState, useEffect, useRef } from 'react';
import { UploadCloud, MapPin, Mail, Phone, CreditCard, Landmark, Save } from 'lucide-react';
import { fetchGeneratorProfile, updateGeneratorProfile, uploadGeneratorLogo, fetchCurrentUser } from '../../services/api';
import '../styles/GeneratorProfile.css';

const GeneratorProfile = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [logoImage, setLogoImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    // User fields
    full_name: '',
    // Profile fields (matches GeneratorProfileUpdate schema)
    institution_name: '',
    institution_type: 'restaurant',
    street_address: '',
    city: '',
    postal_code: '',
    phone_number: '',
    billing_name: '',
    billing_address: '',
    invoice_email: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadData() {
      try {
        // Fetch both user info and profile in parallel
        const [user, profile] = await Promise.all([
          fetchCurrentUser(),
          fetchGeneratorProfile(),
        ]);

        setFormData({
          full_name:        user?.full_name || '',
          institution_name: profile?.institution_name || '',
          institution_type: profile?.institution_type || 'restaurant',
          street_address:   profile?.street_address || '',
          city:             profile?.city || '',
          postal_code:      profile?.postal_code || '',
          phone_number:     profile?.phone_number || '',
          billing_name:     profile?.billing_name || '',
          billing_address:  profile?.billing_address || '',
          invoice_email:    profile?.invoice_email || '',
        });

        if (profile?.payment_method) setPaymentMethod(profile.payment_method);

        // Construct logo URL — backend serves from /uploads/
        if (profile?.logo_path) {
          const clean = profile.logo_path.replace(/^uploads[\\/]/, '');
          setLogoImage(`https://wastebridge-backend.onrender.com/uploads/${clean}`);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoImage(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
    try {
      await uploadGeneratorLogo(file);
      setMessage({ type: 'success', text: 'Logo updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload logo.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      // Send all fields — backend uses exclude_unset so empty strings update the field
      await updateGeneratorProfile({
        full_name:        formData.full_name        || undefined,
        institution_name: formData.institution_name || undefined,
        institution_type: formData.institution_type || undefined,
        street_address:   formData.street_address   || undefined,
        city:             formData.city             || undefined,
        postal_code:      formData.postal_code      || undefined,
        phone_number:     formData.phone_number     || undefined,
        billing_name:     formData.billing_name     || undefined,
        billing_address:  formData.billing_address  || undefined,
        invoice_email:    formData.invoice_email    || undefined,
        payment_method:   paymentMethod,
      });
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading profile...</div>;
  }

  const initials = formData.institution_name
    ? formData.institution_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'GB';

  return (
    <div className="generator-profile-page">

      {message.text && (
        <div style={{
          padding: '12px 16px', marginBottom: '20px', borderRadius: '8px',
          background: message.type === 'error' ? '#fef2f2' : '#ecfdf5',
          color: message.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          fontSize: '14px',
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">

        {/* INSTITUTION DETAILS */}
        <div className="dashboard-card profile-section">
          <div className="section-header">
            <h2>Institution Details</h2>
            <p>Update your public profile and contact information.</p>
          </div>

          <div className="section-body">
            {/* Logo */}
            <div className="logo-upload-row">
              <div className="current-logo">
                {logoImage
                  ? <img src={logoImage} alt="Logo" className="profile-logo-img" />
                  : <span className="logo-placeholder">{initials}</span>
                }
              </div>
              <div className="upload-actions">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload}
                  accept="image/png, image/jpeg" style={{ display: 'none' }} />
                <button type="button" className="btn btn-outline-dark btn-sm upload-btn"
                  onClick={() => fileInputRef.current.click()}>
                  <UploadCloud size={16} /> Upload New Logo
                </button>
                <p className="upload-hint">JPG or PNG, max 2MB. Recommended 200×200px.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Institution Name</label>
                <input type="text" name="institution_name" value={formData.institution_name}
                  onChange={handleChange} placeholder="Green Bites Restaurant" className="basic-input" />
              </div>

              <div className="form-group">
                <label>Institution Type</label>
                <select name="institution_type" value={formData.institution_type}
                  onChange={handleChange} className="custom-select-input">
                  <option value="restaurant">Restaurant / Cafe</option>
                  <option value="hotel">Hotel / Hospitality</option>
                  <option value="school">School / College</option>
                  <option value="corporate">Corporate Office</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="bakery">Bakery / Cafe</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Street Address</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input type="text" name="street_address" value={formData.street_address}
                    onChange={handleChange} placeholder="123 Food Street, Gulberg III" />
                </div>
              </div>

              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} placeholder="Lahore" className="basic-input" />
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input type="text" name="postal_code" value={formData.postal_code}
                  onChange={handleChange} placeholder="54000" className="basic-input" />
              </div>
            </div>

            <div className="divider" />
            <h3>Primary Contact</h3>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Contact Person Full Name</label>
                <input type="text" name="full_name" value={formData.full_name}
                  onChange={handleChange} placeholder="Ali Khan" className="basic-input" />
              </div>

              <div className="form-group full-width">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input type="tel" name="phone_number" value={formData.phone_number}
                    onChange={handleChange} placeholder="+92 300 1234567" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BILLING */}
        <div className="dashboard-card profile-section">
          <div className="section-header">
            <h2>Billing & Payments</h2>
            <p>Manage billing details and payment preferences.</p>
          </div>

          <div className="section-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Billing Name (Legal Entity)</label>
                <input type="text" name="billing_name" value={formData.billing_name}
                  onChange={handleChange} placeholder="Green Bites Pvt. Ltd." className="basic-input" />
              </div>

              <div className="form-group full-width">
                <label>Billing Address (if different from above)</label>
                <input type="text" name="billing_address" value={formData.billing_address}
                  onChange={handleChange} placeholder="Same as institution address" className="basic-input" />
              </div>

              <div className="form-group full-width">
                <label>Invoice Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input type="email" name="invoice_email" value={formData.invoice_email}
                    onChange={handleChange} placeholder="finance@greenbites.com" />
                </div>
              </div>
            </div>

            <div className="divider" />
            <h3>Payment Method</h3>

            <div className="payment-method-selector">
              <button type="button"
                className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}>
                <CreditCard size={24} className={paymentMethod === 'card' ? 'text-green' : 'text-gray'} />
                <span>Credit / Debit Card</span>
              </button>
              <button type="button"
                className={`payment-method-btn ${paymentMethod === 'bank' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('bank')}>
                <Landmark size={24} className={paymentMethod === 'bank' ? 'text-green' : 'text-gray'} />
                <span>Bank Transfer</span>
              </button>
            </div>

            <div className="payment-details-placeholder">
              {paymentMethod === 'card'
                ? <p>Card payments securely processed. Ending in •••• 4242</p>
                : <p>Bank transfer: IBAN PK32 HABB 0000 0012 3456 78</p>
              }
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button type="submit" className="btn btn-primary btn-lg save-btn" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default GeneratorProfile;
