import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import { mockUsers } from '../data/properties';

const AuthContext = createContext(undefined);

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health', { 
      signal: AbortSignal.timeout(2000) 
    });
    return response.ok;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    // Initialize from localStorage if available, otherwise use mockUsers
    const savedUsers = localStorage.getItem('allUsers');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch {
        return mockUsers;
      }
    }
    return mockUsers;
  });
  const [useBackend, setUseBackend] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const backendAvailable = await isBackendAvailable();
      setUseBackend(backendAvailable);

      if (backendAvailable) {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await authAPI.getMe();
            setUser(response.user);
          } catch {
            localStorage.removeItem('authToken');
          }
        }
      } else {
        // Demo mode - load from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // Ensure arrays exist
            parsedUser.savedProperties = parsedUser.savedProperties || [];
            parsedUser.viewedProperties = parsedUser.viewedProperties || [];
            setUser(parsedUser);
          } catch (error) {
            localStorage.removeItem('currentUser');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('allUsers', JSON.stringify(users));
  }, [users]);

  const login = async (email, password) => {
    if (useBackend) {
      try {
        const response = await authAPI.login({ email, password });
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    } else {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundUser = users.find(u => u.email === email && !u.isBlocked);
      if (foundUser) {
        // Ensure arrays exist
        const userToLogin = {
          ...foundUser,
          savedProperties: foundUser.savedProperties || [],
          viewedProperties: foundUser.viewedProperties || []
        };
        setUser(userToLogin);
        localStorage.setItem('currentUser', JSON.stringify(userToLogin));
        return true;
      }
      return false;
    }
  };

  const register = async (name, email, password, phone, role) => {
    if (useBackend) {
      try {
        const response = await authAPI.register({ name, email, password, phone, role });
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return true;
      } catch (error) {
        console.error('Register error:', error);
        return false;
      }
    } else {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 500));
      const exists = users.find(u => u.email === email);
      if (exists) return false;

      const newUser = {
        id: `USER${Date.now()}`,
        name,
        email,
        phone,
        role,
        createdAt: new Date().toISOString(),
        isBlocked: false,
        savedProperties: [],
        viewedProperties: [],
        inquiries: []
      };

      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  // FIXED: updateSavedProperties function
  const updateSavedProperties = useCallback((propertyId) => {
    if (!user || !propertyId) {
      console.log('updateSavedProperties: Missing user or propertyId');
      return;
    }

    setUser(currentUser => {
      if (!currentUser) return null;

      const currentSaved = currentUser.savedProperties || [];
      const isAlreadySaved = currentSaved.includes(propertyId);
      
      // Toggle: remove if exists, add if not
      const newSavedProperties = isAlreadySaved
        ? currentSaved.filter(id => id !== propertyId)
        : [...currentSaved, propertyId];

      const updatedUser = {
        ...currentUser,
        savedProperties: newSavedProperties
      };

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Also update in users array
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === currentUser.id ? updatedUser : u)
      );

      console.log('Saved properties updated:', {
        propertyId,
        action: isAlreadySaved ? 'removed' : 'added',
        newSavedProperties
      });

      return updatedUser;
    });
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const getAllUsers = async () => {
    if (useBackend) {
      try {
        const response = await authAPI.getUsers();
        return response.users;
      } catch {
        return users.filter(u => u.role !== 'Admin');
      }
    }
    return users.filter(u => u.role !== 'Admin');
  };

  const blockUser = (userId) => {
    if (useBackend) {
      authAPI.toggleUserBlock(userId).catch(console.error);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
  };

  const unblockUser = (userId) => {
    if (useBackend) {
      authAPI.toggleUserBlock(userId).catch(console.error);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
  };

  const updateUserRole = (userId, role) => {
    if (useBackend) {
      authAPI.updateUserRole(userId, role).catch(console.error);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      useBackend,
      login,
      register,
      logout,
      updateSavedProperties,
      getAllUsers,
      blockUser,
      unblockUser,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
