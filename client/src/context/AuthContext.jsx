import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('leximem_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('leximem_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('leximem_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth check error, clearing session');
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('leximem_token', newToken);
      localStorage.setItem('leximem_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('leximem_token', newToken);
      localStorage.setItem('leximem_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('leximem_token');
    localStorage.removeItem('leximem_user');
  };

  // Fast switch demo helper
  const switchDemoRole = async (role) => {
    const credentials = {
      admin: { email: 'admin@leximem.com', password: 'LexiMemAdmin2026!' },
      lawyer: { email: 'lawyer@leximem.com', password: 'LexiMemLawyer2026!' },
      business_user: { email: 'employee@leximem.com', password: 'LexiMemEmployee2026!' },
    };
    if (credentials[role]) {
      return login(credentials[role].email, credentials[role].password);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      switchDemoRole,
      isAdmin: user?.role === 'admin',
      isLawyer: user?.role === 'lawyer' || user?.role === 'admin',
      isBusinessUser: user?.role === 'business_user',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
