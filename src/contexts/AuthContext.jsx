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
        // Configure axios defaults
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.timeout = 30000;
        axios.defaults.withCredentials = false;
        
        // Check for stored token
        const token = localStorage.getItem('cipherstudio:token');
        const backend = localStorage.getItem('cipherstudio:backend') || import.meta.env.VITE_API_URL || 'https://backend-cipher.onrender.com';
        axios.defaults.baseURL = backend;
        
        if (token) {
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
      const backendUrl = localStorage.getItem('cipherstudio:backend') || import.meta.env.VITE_API_URL || 'https://backend-cipher.onrender.com';
      const response = await axios.get(`${backendUrl}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('cipherstudio:token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setAuthError('');
      
      // Try multiple backend URLs
      const backendUrls = [
        localStorage.getItem('cipherstudio:backend'),
        import.meta.env.VITE_API_URL,
        'https://backend-cipher.onrender.com',
        'http://localhost:4000'
      ].filter(Boolean);
      
      let lastError;
      for (const backendUrl of backendUrls) {
        try {
          console.log('Trying login to:', `${backendUrl}/api/auth/login`);
          const response = await axios.post(`${backendUrl}/api/auth/login`, 
            { email, password }, 
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000
            }
          );
          
          const { token, user: userData } = response.data;
          localStorage.setItem('cipherstudio:token', token);
          localStorage.setItem('cipherstudio:backend', backendUrl);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(userData);
          return { success: true };
        } catch (err) {
          console.log(`Failed with ${backendUrl}:`, err.message);
          lastError = err;
          continue;
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('All login attempts failed:', error);
      let errorMsg = 'Network error - backend unavailable';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout - server may be sleeping';
      }
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
      const backendUrl = localStorage.getItem('cipherstudio:backend') || import.meta.env.VITE_API_URL || 'https://backend-cipher.onrender.com';
      console.log('Attempting register to:', `${backendUrl}/api/auth/register`);
      const response = await axios.post(`${backendUrl}/api/auth/register`, { 
        email, 
        password,
        name 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('cipherstudio:token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
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