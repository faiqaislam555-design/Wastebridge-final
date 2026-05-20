import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, AlertTriangle, BarChart3, LogOut, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, currentUser } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'User Verification', icon: <CheckSquare size={20} />, path: '/admin/verifications' },
    { name: 'Disputes', icon: <AlertTriangle size={20} />, path: '/admin/disputes' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
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

        <div className="admin-badge">
          <ShieldAlert size={14} /> System Admin
        </div>

        <nav className="sidebar-nav" style={{marginTop: '12px'}}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar admin-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Admin User'}</span>
              <a href="/" className="logout-link" onClick={logout}>
                <LogOut size={14} />
                Logout
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
