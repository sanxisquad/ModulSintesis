/**
 * Central API configuration with environment-based URLs
 */

/**
 * Gets the base URL for API requests based on environment
 */
const getBaseUrl = () => {
  // Use environment variable if available
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback to default URLs if not set
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Default fallbacks based on hostname
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  return isLocalhost ? 'http://localhost:8000' : 'https://reciclaja.duckdns.org';
};

/**
 * Get base URLs for different services
 */
const getBaseUrls = () => {
  const baseUrl = getBaseUrl();
  
  return {
    auth: `${baseUrl}/auth/api/v1/`,
    authService: `${baseUrl}/auth/api/v1/auth/`,
    zr: `${baseUrl}/zr/`,
  };
};

const apiConfig = {
  getBaseUrl,
  getBaseUrls,
};

export default apiConfig;
