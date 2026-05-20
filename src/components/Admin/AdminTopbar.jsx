import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, UserCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../dashboard/styles/Dropdown.css';

const AdminTopbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
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
  
  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar hidden-mobile">
          <Search size={18} />
          <input type="text" placeholder="Search system records..." />
        </div>
      </div>
      
      <div className="topbar-right" ref={dropdownRef}>
        <div className="header-dropdown-container">
          <button 
            className="icon-btn notification-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="header-dropdown-menu notifications">
              <div className="dropdown-header">Admin Alerts</div>
              <div className="notification-item">
                <span className="notification-title">New Company Registration</span>
                <span className="notification-desc">BioConvert Lahore requires verification.</span>
              </div>
              <div className="notification-item">
                <span className="notification-title">Dispute Escalation</span>
                <span className="notification-desc">DSP-042 requires admin intervention.</span>
              </div>
            </div>
          )}
        </div>

        <div className="header-dropdown-container">
          <div 
            className="user-menu" 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            style={{cursor: 'pointer'}}
          >
            <UserCircle size={24} className="text-gray-500" />
            <div className="user-menu-text hidden-mobile">
              <span className="user-name">{currentUser?.name || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>

          {showProfile && (
            <div className="header-dropdown-menu">
              <div className="dropdown-header">System Admin</div>
              <div className="dropdown-item">
                <Settings size={16} /> System Settings
              </div>
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

export default AdminTopbar;
