import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem('qrbuilder_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => window.localStorage.getItem('qrbuilder_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      window.localStorage.setItem('qrbuilder_token', token);
    } else {
      delete axios.defaults.headers.common.Authorization;
      window.localStorage.removeItem('qrbuilder_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('qrbuilder_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('qrbuilder_user');
    }
  }, [user]);

  const register = async (payload) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/register`, payload);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.join(' ') || 'Registration failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, payload);
      setUser(response.data.user);
      setToken(response.data.token);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setError('');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, register, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
