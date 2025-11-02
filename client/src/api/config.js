// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  UPLOAD: '/upload',
  LIST: '/list',
  DOWNLOAD: '/download',
  BACKUP: '/backup',
  RESTORE: '/restore',
};

export default API_BASE_URL;
