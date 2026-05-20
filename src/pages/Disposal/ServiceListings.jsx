import { useState, useEffect } from 'react';
import { Plus, Pause, Play, Trash2, Leaf, Flame, Beef, Recycle, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import './ServiceListings.css';

const WASTE_TYPE_OPTIONS = ['Cooked Food', 'Raw Scraps', 'Expired Stock', 'Packaging-Contaminated'];
const METHOD_OPTIONS = [
  { id: 'Composting', label: 'Composting', icon: <Leaf size={20} /> },
  { id: 'Biogas', label: 'Biogas', icon: <Flame size={20} /> },
  { id: 'Animal Feed', label: 'Animal Feed', icon: <Beef size={20} /> },
  { id: 'Recycling', label: 'Recycling', icon: <Recycle size={20} /> },
];

const getMethodIcon = (method) => {
  switch (method) {
    case 'Composting': return <Leaf size={18} />;
    case 'Biogas': return <Flame size={18} />;
    case 'Animal Feed': return <Beef size={18} />;
    case 'Recycling': return <Recycle size={18} />;
    default: return <Leaf size={18} />;
  }
};

const getChipClass = (type) => {
  if (type.includes('Cooked')) return 'chip-orange';
  if (type.includes('Raw')) return 'chip-green';
  if (type.includes('Expired')) return 'chip-red';
  if (type.includes('Packaging')) return 'chip-blue';
  return 'chip-gray';
};

const EMPTY_FORM = {
  name: '',
  method: '',
  wasteTypes: [],
  capacity: '',
  pricing: '',
  coverage: '',
};

const ServiceListings = () => {
  const { serviceListings, addListing, toggleListingStatus, deleteListing, stats } = useDisposal();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleToggleWasteType = (type) => {
    setForm(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(type)
        ? prev.wasteTypes.filter(t => t !== type)
        : [...prev.wasteTypes, type],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.method || form.wasteTypes.length === 0 || !form.capacity || !form.pricing) return;
    addListing(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="service-listings-page">

      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div className="page-header-info">
          <h2>My Service Listings</h2>
          <span className="listing-count">{stats.activeListings} active · {stats.totalListings} total</span>
        </div>
        <button
          className="btn btn-primary btn-sm add-listing-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add New Listing'}
        </button>
      </div>

      {/* ADD LISTING FORM (collapsible) */}
      {showForm && (
        <div className="dashboard-card add-listing-card">
          <h3>Create New Listing</h3>
          <form onSubmit={handleSubmit} className="listing-form">
            <div className="listing-form-grid">
              {/* Service Name */}
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  className="basic-input"
                  placeholder="e.g. Organic Composting Service"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              {/* Coverage Area */}
              <div className="form-group">
                <label>Coverage Area</label>
                <input
                  type="text"
                  className="basic-input"
                  placeholder="e.g. Lahore, Multan"
                  value={form.coverage}
                  onChange={e => setForm(p => ({ ...p, coverage: e.target.value }))}
                />
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="text"
                  className="basic-input"
                  placeholder="e.g. 500 kg/day"
                  value={form.capacity}
                  onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                  required
                />
              </div>

              {/* Pricing */}
              <div className="form-group">
                <label>Pricing</label>
                <input
                  type="text"
                  className="basic-input"
                  placeholder="e.g. ₨ 8/kg"
                  value={form.pricing}
                  onChange={e => setForm(p => ({ ...p, pricing: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Disposal Method */}
            <div className="form-group">
              <label>Disposal Method</label>
              <div className="method-selector">
                {METHOD_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`method-tile ${form.method === m.id ? 'selected' : ''}`}
                    onClick={() => setForm(p => ({ ...p, method: m.id }))}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                    {form.method === m.id && <CheckCircle2 size={14} className="method-check" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Waste Types */}
            <div className="form-group">
              <label>Accepted Waste Types</label>
              <div className="waste-type-checkboxes">
                {WASTE_TYPE_OPTIONS.map(type => (
                  <label key={type} className={`waste-checkbox ${form.wasteTypes.includes(type) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.wasteTypes.includes(type)}
                      onChange={() => handleToggleWasteType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions-row">
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} />
                Create Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTING CARDS GRID */}
      <div className="listings-grid">
        {serviceListings.length === 0 && (
          <div className="dashboard-card empty-state-card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-content">
              <Leaf size={40} />
              <h3>No service listings yet</h3>
              <p>Click "Add New Listing" to create your first service.</p>
            </div>
          </div>
        )}

        {serviceListings.map((listing) => (
          <div key={listing.id} className={`dashboard-card listing-card ${listing.status === 'Paused' ? 'listing-paused' : ''}`}>
            {/* Card Header */}
            <div className="listing-card-header">
              <div className="listing-method-icon">
                {getMethodIcon(listing.method)}
              </div>
              <div className="listing-title">
                <h3>{listing.name}</h3>
                <span className="listing-method-label">{listing.method}</span>
              </div>
              <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                {listing.status}
              </span>
            </div>

            {/* Card Body */}
            <div className="listing-card-body">
              <div className="listing-detail-row">
                <span className="detail-label">Capacity</span>
                <span className="detail-value">{listing.capacity}</span>
              </div>
              <div className="listing-detail-row">
                <span className="detail-label">Pricing</span>
                <span className={`detail-value ${listing.pricing.includes('Pays') ? 'pricing-pays' : ''}`}>
                  {listing.pricing}
                </span>
              </div>
              <div className="listing-detail-row">
                <span className="detail-label">Coverage</span>
                <span className="detail-value">{listing.coverage}</span>
              </div>

              <div className="listing-waste-types">
                {listing.wasteTypes.map((type, idx) => (
                  <span key={idx} className={`chip ${getChipClass(type)}`}>{type}</span>
                ))}
              </div>
            </div>

            {/* Card Actions */}
            <div className="listing-card-actions">
              <button
                className="listing-action-btn toggle-btn"
                onClick={() => toggleListingStatus(listing.id)}
                title={listing.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
              >
                {listing.status === 'Active' ? <Pause size={15} /> : <Play size={15} />}
                <span>{listing.status === 'Active' ? 'Pause' : 'Activate'}</span>
              </button>
              <button
                className="listing-action-btn delete-btn"
                onClick={() => deleteListing(listing.id)}
                title="Delete Listing"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ServiceListings;
