// Central API configuration for environment detection

// Environment detection
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Base URLs by service
const getBaseUrls = () => {
  const BASE_URL = isLocalhost() 
    ? 'http://localhost:8000' 
    : 'https://api.reciclamja.com'; // Replace with your production URL
    
  return {
    auth: `${BASE_URL}/auth/api/v1/`,
    authService: `${BASE_URL}/auth/api/v1/auth/`,
    zr: `${BASE_URL}/zr/`,
  };
};

export const apiConfig = {
  getBaseUrls,
  isLocalhost
};

export default apiConfig;
