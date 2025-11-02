import API_BASE_URL, { API_ENDPOINTS } from './config';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('authToken');
  
  console.log(`[API] ${options.method || 'GET'} ${endpoint}, Token: ${token ? token.substring(0, 20) + '...' : 'NONE'}`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    console.log(`[API] Response status: ${response.status}`, data);
    
    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      console.error(`[API] Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // Check server health
  checkHealth: () => apiCall(API_ENDPOINTS.HEALTH),

  // Authentication
  signup: async (email, password, fullName) => {
    try {
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      
      console.log('Signup response:', response);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        console.log('✅ Token stored:', response.token.substring(0, 20) + '...');
        console.log('✅ Token in localStorage:', localStorage.getItem('authToken').substring(0, 20) + '...');
      } else {
        console.error('❌ No token in response');
        throw new Error('No authentication token received');
      }
      
      return response;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response:', response);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        console.log('✅ Token stored:', response.token.substring(0, 20) + '...');
        console.log('✅ Token in localStorage:', localStorage.getItem('authToken').substring(0, 20) + '...');
      } else {
        console.error('❌ No token in response');
        throw new Error('No authentication token received');
      }
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  getCurrentUser: () => apiCall('/auth/me'),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Upload file
  uploadFile: (filename, content, encoding = 'base64') => 
    apiCall(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: JSON.stringify({ filename, content, encoding }),
    }),

  // List files
  listFiles: (userPath = null) => 
    apiCall(API_ENDPOINTS.LIST, {
      method: 'POST',
      body: JSON.stringify({ user_path: userPath }),
    }),

  // Download file
  downloadFile: (filename) => 
    apiCall(API_ENDPOINTS.DOWNLOAD, {
      method: 'POST',
      body: JSON.stringify({ filename }),
    }),

  // Create backup
  createBackup: (backupName = null) => 
    apiCall(API_ENDPOINTS.BACKUP, {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName }),
    }),

  // Restore from backup
  restoreBackup: (backupName) => 
    apiCall(API_ENDPOINTS.RESTORE, {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName }),
    }),
};

export default api;
