import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('scholaverse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [roleProfile, setRoleProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scholaverse_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('scholaverse_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.data.user);
            setRoleProfile(res.data.roleProfile);
            localStorage.setItem('scholaverse_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('[AuthInit] Session expired or invalid:', err.message);
          localStorage.removeItem('scholaverse_token');
          localStorage.removeItem('scholaverse_user');
          setUser(null);
          setRoleProfile(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      const { token: newToken, user: userData, roleProfile: profileData } = res.data;
      localStorage.setItem('scholaverse_token', newToken);
      localStorage.setItem('scholaverse_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setRoleProfile(profileData);
      return { user: userData, roleProfile: profileData };
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('scholaverse_token');
      localStorage.removeItem('scholaverse_user');
      setUser(null);
      setRoleProfile(null);
      setToken(null);
    }
  };

  const value = {
    user,
    roleProfile,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    isGuardian: user?.role === 'GUARDIAN',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
