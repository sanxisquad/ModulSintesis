// Central API configuration using environment variables

// Get environment-specific API URL from environment variables
const getBaseUrls = () => {
  // This will automatically use the correct value based on the environment
  const BASE_URL = process.env.REACT_APP_API_URL;
  
  console.log('Using API URL:', BASE_URL);
  
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
