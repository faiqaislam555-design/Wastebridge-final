import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, UserCircle, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../dashboard/styles/Dropdown.css';
import './SharedTopbar.css';

const SharedTopbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="shared-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="shared-search-bar hidden-mobile">
          <Search size={18} />
          <input type="text" placeholder="Search across shared portal..." />
        </div>
      </div>
      
      <div className="topbar-right" ref={dropdownRef}>
        <div className="header-dropdown-container">
          <div 
            className="shared-user-menu" 
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="user-avatar-wrapper">
              {currentUser?.name ? currentUser.name.substring(0, 1).toUpperCase() : 'U'}
            </div>
            <div className="user-menu-text hidden-mobile">
              <span className="user-name">{currentUser?.name || 'User'}</span>
              <span className="user-role">{currentUser?.role || 'Member'}</span>
            </div>
            <ChevronDown size={16} className={`chevron-icon ${showProfile ? 'rotate' : ''}`} style={{ marginLeft: '4px', color: '#9ca3af' }} />
          </div>

          {showProfile && (
            <div className="header-dropdown-menu">
              <div className="dropdown-header">Shared Account</div>
              <Link to="/shared/settings" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <Settings size={16} /> Portal Settings
              </Link>
              <div className="dropdown-divider"></div>
              <Link to="/login" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <LogOut size={16} /> Sign Out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SharedTopbar;
