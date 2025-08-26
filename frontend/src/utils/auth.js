// src/utils/auth.js
import axios from 'axios';

// Token management
export const getAdminToken = () => localStorage.getItem('adminToken');
export const setAdminToken = (token) => localStorage.setItem('adminToken', token);
export const removeAdminToken = () => localStorage.removeItem('adminToken');

// User management
export const getAdminUser = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

export const setAdminUser = (user) => {
  localStorage.setItem('adminUser', JSON.stringify(user));
};

export const removeAdminUser = () => {
  localStorage.removeItem('adminUser');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAdminToken();
  return !!token;
};

// Setup axios interceptors
export const setupAxiosInterceptors = (navigate) => {
  // Request interceptor to add token
  axios.interceptors.request.use(
    (config) => {
      const token = getAdminToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        logout();
        if (navigate) {
          navigate('/admin/login');
        } else {
          window.location.href = '/admin/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Logout function
export const logout = () => {
  removeAdminToken();
  removeAdminUser();
  delete axios.defaults.headers.common['Authorization'];
};

// Login function
export const login = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/admin-login', credentials);
    const { token, user } = response.data;
    
    setAdminToken(token);
    setAdminUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};

// Protected route wrapper
export const requireAuth = (component) => {
  return isAuthenticated() ? component : null;
};