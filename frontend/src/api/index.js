// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://propert-valuation-and-market-analysis.onrender.com/api';

// Check if backend is available
let backendAvailable = false;

export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    backendAvailable = response.ok;
    return backendAvailable;
  } catch {
    backendAvailable = false;
    return false;
  }
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (data) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  toggleSaveProperty: (propertyId) => apiRequest(`/auth/save-property/${propertyId}`, {
    method: 'PUT'
  }),

  // Admin
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/auth/users?${queryString}`);
  },

  toggleUserBlock: (userId) => apiRequest(`/auth/users/${userId}/block`, {
    method: 'PUT'
  }),

  updateUserRole: (userId, role) => apiRequest(`/auth/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  })
};

// Properties API
export const propertiesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/properties?${queryString}`);
  },

  getFeatured: (limit = 6) => apiRequest(`/properties/featured?limit=${limit}`),

  getOne: (id) => apiRequest(`/properties/${id}`),

  create: (propertyData) => apiRequest('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData)
  }),

  update: (id, propertyData) => apiRequest(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData)
  }),

  delete: (id) => apiRequest(`/properties/${id}`, {
    method: 'DELETE'
  }),

  getSellerProperties: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/properties/seller/my-properties?${queryString}`);
  },

  // Admin
  getPendingProperties: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/properties/admin/pending?${queryString}`);
  },

  approveProperty: (id) => apiRequest(`/properties/${id}/approve`, {
    method: 'PUT'
  }),

  rejectProperty: (id) => apiRequest(`/properties/${id}/reject`, {
    method: 'PUT'
  }),

  getStats: () => apiRequest('/properties/admin/stats')
};

// Leads API
export const leadsAPI = {
  create: (leadData) => apiRequest('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData)
  }),

  getBuyerLeads: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/leads/buyer?${queryString}`);
  },

  getSellerLeads: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/leads/seller?${queryString}`);
  },

  updateStatus: (id, data) => apiRequest(`/leads/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  scheduleVisit: (id, visitDate) => apiRequest(`/leads/${id}/schedule-visit`, {
    method: 'PUT',
    body: JSON.stringify({ visitDate })
  }),

  addFollowUp: (id, note) => apiRequest(`/leads/${id}/follow-up`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  // Admin
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/leads/admin?${queryString}`);
  },

  getStats: () => apiRequest('/leads/stats')
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default { 
  authAPI, 
  propertiesAPI, 
  leadsAPI, 
  healthCheck,
  checkBackendStatus 
};
