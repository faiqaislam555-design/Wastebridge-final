import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Search, ChevronDown, Filter, XCircle } from 'lucide-react';
import { fetchOperators } from '../../services/api';
import '../styles/BrowseCompanies.css';

const BrowseCompanies = () => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    waste_type: '',
    city: 'All',
    min_rating: 'all',
    pricing_model: ''
  });

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadOperators = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchOperators({
        waste_type: filters.waste_type,
        city: filters.city,
        min_rating: filters.min_rating,
        pricing_model: filters.pricing_model
      });
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, [filters]);

  const handleFilterChange = (e, filterName) => {
    setFilters(prev => ({ ...prev, [filterName]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ waste_type: '', city: 'All', min_rating: 'all', pricing_model: '' });
  };

  // Helper to get chip color based on waste type
  const getChipClass = (type) => {
    if (type.includes('Cooked')) return 'chip-orange';
    if (type.includes('Raw')) return 'chip-green';
    if (type.includes('Expired')) return 'chip-red';
    if (type.includes('Packaging')) return 'chip-blue';
    return 'chip-gray';
  };

  return (
    <div className="browse-companies-page">

      {/* FILTER BAR SECTION */}
      <div className="dashboard-card filter-card">

        {/* Mobile Toggle */}
        <div className="mobile-filter-header">
          <h3>Find Disposal Partners</h3>
          <button
            className="mobile-filter-toggle"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className={`filter-bar ${mobileFilterOpen ? 'filter-bar-open' : ''}`}>

          <div className="filter-group">
            <label>Waste Type</label>
            <div className="custom-select">
              <select
                value={filters.waste_type}
                onChange={(e) => handleFilterChange(e, 'waste_type')}
              >
                <option value="">All Types</option>
                <option value="cooked">Cooked Food</option>
                <option value="raw">Raw Scraps</option>
                <option value="expired">Expired Stock</option>
                <option value="packaging">Packaging-Contaminated</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>City</label>
            <div className="custom-select">
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange(e, 'city')}
              >
                <option value="All">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
                <option value="Karachi">Karachi</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Min Rating</label>
            <div className="custom-select">
              <select
                value={filters.min_rating}
                onChange={(e) => handleFilterChange(e, 'min_rating')}
              >
                <option value="all">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Pricing Model</label>
            <div className="custom-select">
              <select
                value={filters.pricing_model}
                onChange={(e) => handleFilterChange(e, 'pricing_model')}
              >
                <option value="">Any Model</option>
                <option value="per_kg">Per Kg</option>
                <option value="flat">Flat Rate</option>
                <option value="pays">Pays Generator</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-action" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline-dark btn-apply" onClick={clearFilters} style={{ padding: '0 12px' }} title="Clear Filters">
              <XCircle size={16} />
            </button>
            <button
              className="btn btn-primary btn-apply"
              onClick={() => setMobileFilterOpen(false)}
            >
              <Search size={16} />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className="company-grid">
        {isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>Loading operators...</p>
          </div>
        )}

        {error && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && companies.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Search size={40} style={{ opacity: 0.2, marginBottom: '16px', display: 'inline-block' }} />
            <h3>No companies match your filters</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}

        {!isLoading && companies.map((company) => (
          <div key={company.id} className="dashboard-card company-card">

            <div className="company-card-header">
              <div className="company-logo-large">{company.logo_letter}</div>
              <div className="company-title">
                <h2>{company.company_name}</h2>
                <div className="company-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span className="rating-score">{company.rating}</span>
                  <span className="rating-count">({company.review_count})</span>
                </div>
              </div>
            </div>

            <div className="company-card-body">
              <div className="company-detail">
                <MapPin size={16} className="detail-icon" />
                <span>{company.city || 'Anywhere'}</span>
              </div>

              <div className="company-detail pricing-detail">
                <span className="pricing-label">Pricing:</span>
                <span className={`pricing-value ${company.pricing_model === 'pays' ? 'pricing-pays' : ''}`}>
                  {(() => {
                    if (!company.pricing_value) return 'Contact for pricing';
                    const val = company.pricing_value;
                    switch (company.pricing_model) {
                      case 'per_kg': return `₨ ${val}/kg`;
                      case 'flat': return `₨ ${val}/month`;
                      case 'pays': return `Pays you ₨ ${val}/kg`;
                      default: return 'Contact for pricing';
                    }
                  })()}
                </span>
              </div>

              <div className="waste-chips">
                {(company.service_types || '').split(',').map((type, idx) => (
                  <span key={idx} className={`chip ${getChipClass(type)}`}>
                    {type.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="company-card-footer" style={{ justifyContent: 'center' }}>
              <Link
                to={`/generator/request-pickup?company=${company.id}`}
                state={{ company: company }}
                className="btn btn-primary btn-sm request-btn"
              >
                Request Pickup
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default BrowseCompanies;
