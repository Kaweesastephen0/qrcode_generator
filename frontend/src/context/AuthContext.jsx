import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.data.user);
        } catch {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
    };
    verifyToken();
  }, [token]);

  const register = async (fullName, email, password, confirmPassword) => {
    const response = await authAPI.register({ fullName, email, password, confirmPassword });
    const { token: newToken, user: newUser } = response.data.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    return response.data;
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = response.data.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);