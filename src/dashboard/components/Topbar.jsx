import { useState, useRef, useEffect } from 'react';
import { Bell, User, Menu, Settings, LogOut, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/Dropdown.css';

const Topbar = ({ toggleSidebar }) => {
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
      case '/generator': return 'Dashboard';
      case '/generator/log-waste': return 'Log Waste';
      case '/generator/browse': return 'Browse Companies';
      case '/generator/pickup': return 'Request Pickup';
      case '/generator/history': return 'Pickup History';
      case '/generator/reports': return 'Compliance Reports';
      case '/generator/profile': return 'Profile';
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
        <span className="role-badge generator-badge">Generator Portal</span>
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
              <div className="dropdown-header">Notifications</div>
              <div className="notification-item">
                <span className="notification-title">Pickup Scheduled</span>
                <span className="notification-desc">EcoCycle will arrive tomorrow at 10 AM.</span>
              </div>
              <div className="notification-item">
                <span className="notification-title">Certificate Issued</span>
                <span className="notification-desc">Your March compliance certificate is ready.</span>
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
              <div className="dropdown-header">Account</div>
              <Link to="/generator/profile" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link to="/generator/reports" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <FileText size={16} /> Reports
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

export default Topbar;
