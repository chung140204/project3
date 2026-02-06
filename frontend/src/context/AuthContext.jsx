// Authentication context for managing user state and JWT token
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'fashion_store_token';
const USER_KEY = 'fashion_store_user';

// Load token and user from localStorage
const loadAuthData = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.error('Error loading auth data:', error);
    return { token: null, user: null };
  }
};

// Save token and user to localStorage
const saveAuthData = (token, user) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(() => loadAuthData());

  // Update auth data
  const setAuth = (token, user) => {
    saveAuthData(token, user);
    setAuthData({ token, user });
  };

  // Logout - clear auth data
  const logout = () => {
    saveAuthData(null, null);
    setAuthData({ token: null, user: null });
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!authData.token && !!authData.user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return authData.user?.role === 'ADMIN';
  };

  const value = {
    token: authData.token,
    user: authData.user,
    setAuth,
    logout,
    isAuthenticated,
    isAdmin
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthProvider;






