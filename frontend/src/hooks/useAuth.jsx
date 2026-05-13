import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authAPI, tokenService, security } from '../services/api';

const AuthContext = createContext(null);

// Storage keys
const USER_STORAGE_KEY = 'indian_realestate_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-token-' + Date.now());
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email, password, role = 'buyer') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.login(email, password, role);
      
      if (result.success) {
        const { user: userData } = result.data;
        setUser(userData);
        return { success: true, user: userData };
      } else {
        setError(result.message || 'Login failed');
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!userData.email || !security.validateEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (userData.phone && !security.validatePhone(userData.phone)) {
        throw new Error('Please enter a valid phone number');
      }
      
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const result = await authAPI.register(userData);
      
      if (result.success) {
        const { user: newUser } = result.data;
        setUser(newUser);
        return { success: true, user: newUser, message: 'Registration successful!' };
      } else {
        setError(result.message || 'Registration failed');
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
