import { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wb_token');
    if (token) {
      fetchCurrentUser()
        .then((user) => {
          setCurrentUser({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            created_at: user.created_at || null,  // ← add this
          });
        })
        .catch(() => {
          localStorage.removeItem('wb_token');
          localStorage.removeItem('wb_role');
          localStorage.removeItem('wb_user_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tokenData) => {
    localStorage.setItem('wb_token', tokenData.access_token);
    localStorage.setItem('wb_role', tokenData.role);
    localStorage.setItem('wb_user_id', String(tokenData.user_id));
    setCurrentUser({
      id: tokenData.user_id,
      role: tokenData.role,
      full_name: tokenData.full_name || '',
      email: tokenData.email || '',
      created_at: tokenData.created_at || null,  // ← add this
    });
    setCurrentUser({
      id: tokenData.user_id,
      role: tokenData.role,
      full_name: tokenData.full_name || '',
      email: tokenData.email || '',
    });
  };

  const logout = () => {
    localStorage.removeItem('wb_token');
    localStorage.removeItem('wb_role');
    localStorage.removeItem('wb_user_id');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
