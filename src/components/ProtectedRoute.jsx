import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // Wait until AuthContext has finished checking the token
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid #e5e7eb',
            borderTopColor: '#10b981', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'generator') return <Navigate to="/generator/dashboard" replace />;
    if (currentUser.role === 'operator') return <Navigate to="/operator/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
