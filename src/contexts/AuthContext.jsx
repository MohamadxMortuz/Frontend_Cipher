import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Check for stored token
        const token = localStorage.getItem('cipherstudio:token');
        // set axios baseURL from saved backend
        const backend = localStorage.getItem('cipherstudio:backend') || 'http://localhost:4000';
        axios.defaults.baseURL = backend;
        
        if (token) {
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await validateToken(token);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get((axios.defaults.baseURL||'') + '/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      localStorage.removeItem('cipherstudio:token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setAuthError('');
      const response = await axios.post((axios.defaults.baseURL||'') + '/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('cipherstudio:token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setAuthLoading(true);
      setAuthError('');
      const response = await axios.post((axios.defaults.baseURL||'') + '/api/auth/register', { 
        email, 
        password,
        name 
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('cipherstudio:token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cipherstudio:token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      authLoading,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
}