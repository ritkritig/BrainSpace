import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage and verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('brainspace_token');
      const storedUser = localStorage.getItem('brainspace_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          const { data } = await authService.getProfile();
          setUser(data.user || data);
          localStorage.setItem('brainspace_user', JSON.stringify(data.user || data));
        } catch (error) {
          // Token is invalid or expired — clear everything
          console.error('Token verification failed:', error);
          localStorage.removeItem('brainspace_token');
          localStorage.removeItem('brainspace_user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    const { token: newToken, user: newUser } = data;

    localStorage.setItem('brainspace_token', newToken);
    localStorage.setItem('brainspace_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { data } = await authService.signup({ name, email, password });
    const { token: newToken, user: newUser } = data;

    localStorage.setItem('brainspace_token', newToken);
    localStorage.setItem('brainspace_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('brainspace_token');
    localStorage.removeItem('brainspace_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('brainspace_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
