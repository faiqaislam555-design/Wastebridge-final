import { useState, useRef, useEffect } from 'react';
import { Bell, User, Menu, Settings, LogOut, Building } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import '../../dashboard/styles/Dropdown.css';

const DisposalTopbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/operator': return 'Operator Dashboard';
      case '/operator/dashboard': return 'Operator Dashboard';
      case '/operator/requests': return 'Pickup Requests';
      case '/operator/schedule': return 'Schedule Manager';
      case '/operator/certificates': return 'Certificate Issuer';
      case '/operator/profile': return 'Company Profile';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={24} color="#059669" />
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
        <span className="role-badge operator-badge">Operator Portal</span>
      </div>
      
      <div className="topbar-right" ref={dropdownRef}>
        <div className="header-dropdown-container">
          <button 
            className="notification-btn" 
            aria-label="Notifications"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          
          {showNotifications && (
            <div className="header-dropdown-menu notifications">
              <div className="dropdown-header">Alerts</div>
              <div className="notification-item">
                <span className="notification-title">New Pickup Request</span>
                <span className="notification-desc">Haveli Restaurant requested a pickup.</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="header-dropdown-container">
          <div 
            className="topbar-avatar" 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            style={{cursor: 'pointer'}}
          >
            <User size={20} color="#059669" />
          </div>

          {showProfile && (
            <div className="header-dropdown-menu">
              <div className="dropdown-header">Disposal Account</div>
              <Link to="/operator/profile" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <Building size={16} /> Company Profile
              </Link>
              <div className="dropdown-divider"></div>
              <Link to="/login" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <LogOut size={16} /> Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DisposalTopbar;
