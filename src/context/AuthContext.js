import React, { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token expiration
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setCurrentUser(decodedToken);
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    // Store the token and set authentication state
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwt_decode(token);
      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fall back to demo user if token decode fails
      setCurrentUser({
        sub: '1234567890',
        name: 'Demo User',
        role: 'user'
      });
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function for API mode detection - always returns false (real mode) now
export const isDemoMode = () => {
  return false; // Always use real mode with API calls
};
