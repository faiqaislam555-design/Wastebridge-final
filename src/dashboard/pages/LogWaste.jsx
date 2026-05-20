import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Calendar, MapPin, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { createWasteLog, uploadWastePhoto } from '../../services/api';
import '../styles/LogWaste.css';

const LogWaste = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [wasteType, setWasteType] = useState('');
  const [weight, setWeight] = useState(50);
  const [urgency, setUrgency] = useState('flexible');
  const [pickupFrom, setPickupFrom] = useState('');
  const [pickupTo, setPickupTo] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const wasteTypes = [
    { id: 'cooked', label: 'Cooked Food' },
    { id: 'raw', label: 'Raw Scraps' },
    { id: 'expired', label: 'Expired Stock' },
    { id: 'packaging', label: 'Packaging-Contaminated' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWeightChange = (amount) => {
    setWeight((prev) => Math.max(1, prev + amount));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogWaste = async () => {
    if (!wasteType) {
      setError('Please select a waste type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const log = await createWasteLog({
        waste_type: wasteType,
        weight_kg: weight,
        pickup_from: pickupFrom,
        pickup_to: pickupTo,
        location: location,
        notes: notes,
        urgency: urgency
      });

      // Upload photo if one was selected
      if (photo && log.id) {
        await uploadWastePhoto(log.id, photo);
      }

      navigate('/generator/browse');
    } catch (err) {
      setError(err.message || 'Failed to log waste');
      setIsLoading(false);
    }
  };

  return (
    <div className="log-waste-page">
      <div className="dashboard-card form-card">

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' }}>{error}</div>}

        <div className="form-grid">
          {/* LEFT COLUMN */}
          <div className="form-column">

            {/* 1. Waste Type */}
            <div className="form-group">
              <label className="form-label">Waste Type</label>
              <div className="waste-type-grid">
                {wasteTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`waste-type-tile ${wasteType === type.id ? 'selected' : ''}`}
                    onClick={() => setWasteType(type.id)}
                  >
                    <span>{type.label}</span>
                    {wasteType === type.id && <CheckCircle2 size={16} className="check-icon" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Estimated Weight */}
            <div className="form-group">
              <label className="form-label">Estimated Weight (kg)</label>
              <div className="weight-stepper">
                <button type="button" onClick={() => handleWeightChange(-10)} className="stepper-btn">
                  <Minus size={18} />
                </button>
                <div className="weight-input-wrapper">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min="1"
                  />
                  <span className="weight-unit">kg</span>
                </div>
                <button type="button" onClick={() => handleWeightChange(10)} className="stepper-btn">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* 3. Pickup Window */}
            <div className="form-group">
              <label className="form-label">Pickup Window</label>
              <div className="date-range-group">
                <div className="date-input-wrapper">
                  <span className="date-label">From</span>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input type="date" className="date-input" value={pickupFrom} onChange={(e) => setPickupFrom(e.target.value)} />
                  </div>
                </div>
                <div className="date-input-wrapper">
                  <span className="date-label">To</span>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input type="date" className="date-input" value={pickupTo} onChange={(e) => setPickupTo(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Location */}
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input type="text" placeholder="Enter pickup address" className="location-input" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="form-column">

            {/* 5. Special Handling Notes */}
            <div className="form-group">
              <label className="form-label">Special Handling Notes</label>
              <textarea
                rows="5"
                placeholder="e.g. allergens present, liquid content, bagged separately"
                className="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            {/* 6. Photo Upload */}
            <div className="form-group">
              <label className="form-label">Photo Upload</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              {!photoPreview ? (
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <UploadCloud size={32} className="upload-icon" />
                  <p>Drag photo here or click to upload (optional)</p>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <p className="upload-hint">Max 5MB, JPG or PNG</p>
            </div>

            {/* 7. Urgency Toggle */}
            <div className="form-group">
              <label className="form-label">Urgency</label>
              <div className="urgency-toggle">
                <button
                  type="button"
                  className={`urgency-btn ${urgency === 'flexible' ? 'selected' : ''}`}
                  onClick={() => setUrgency('flexible')}
                >
                  Flexible
                </button>
                <button
                  type="button"
                  className={`urgency-btn ${urgency === 'urgent' ? 'selected' : ''}`}
                  onClick={() => setUrgency('urgent')}
                >
                  Urgent — within 24h
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="form-bottom">
          <div className="form-divider"></div>
          <div className="action-row">
            <p className="action-hint">We'll show operators who accept your waste type in your city</p>
            <button
              className="btn btn-primary btn-lg action-btn"
              onClick={handleLogWaste}
              disabled={isLoading}
            >
              {isLoading ? 'Logging Waste...' : 'Find Matching Operators'}
              {!isLoading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogWaste;