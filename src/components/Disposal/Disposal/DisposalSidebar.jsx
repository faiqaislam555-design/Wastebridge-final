import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarRange, 
  Award, 
  Building, 
  LogOut, 
  X,
  Bell,
  FileText,
  Star,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DisposalSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/operator/dashboard' },
    { name: 'Incoming Requests', icon: <ClipboardList size={20} />, path: '/operator/requests' },
    { name: 'My Schedule', icon: <CalendarRange size={20} />, path: '/operator/schedule' },
    { name: 'Completed Pickups', icon: <CheckCircle size={20} />, path: '/operator/completed' },
    { name: 'Issue Certificates', icon: <Award size={20} />, path: '/operator/certificates' },
    { type: 'divider' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/dashboard/notifications' },
    { name: 'Documents', icon: <FileText size={20} />, path: '/dashboard/documents' },
    { name: 'Reviews', icon: <Star size={20} />, path: '/dashboard/reviews' },
    { name: 'Invoices', icon: <CreditCard size={20} />, path: '/dashboard/invoices' },
    { type: 'divider' },
    { name: 'Profile', icon: <Building size={20} />, path: '/operator/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      
      <aside className={`dashboard-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="WasteBridge Logo" style={{height: '28px', width: 'auto', objectFit: 'contain'}} />
            <span>WasteBridge</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsOpen(false)} aria-label="Close Sidebar">
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            item.type === 'divider' ? (
              <div key={`divider-${index}`} className="sidebar-divider" style={{ margin: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/operator/dashboard'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Operator'}</span>
              <button onClick={handleLogout} className="logout-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DisposalSidebar;
