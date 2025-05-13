// Central API configuration with fallback values

// Get environment-specific API URL from environment variables with fallback
const getBaseUrls = () => {
  // Use environment variable or fallback to localhost
  const BASE_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://reciclaja.duckdns.org' 
      : 'http://localhost:8000');
  
  console.log('Using API URL:', BASE_URL, 'Environment:', process.env.NODE_ENV);
  
  return {
    auth: `${BASE_URL}/auth/api/v1/`,
    authService: `${BASE_URL}/auth/api/v1/auth/`,
    zr: `${BASE_URL}/zr/`,
  };
};

// For debugging purposes (optional)
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export const apiConfig = {
  getBaseUrls,
  isProduction
};

export default apiConfig;
