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
 */
const getBaseUrls = () => {
  const baseUrl = getBaseUrl();
  const isProd = window.location.hostname !== 'localhost' && 
                window.location.hostname !== '127.0.0.1';
  
  if (isProd) {
    console.log('Using production API URLs');
    return {
      auth: `${baseUrl}/auth/api/v1/`,
      authService: `${baseUrl}/auth/api/v1/auth/`, // Try without the trailing slash
      zr: `${baseUrl}/zr/`,
    };
  }
  
  return {
    auth: `${baseUrl}/auth/api/v1/`,
    authService: `${baseUrl}/auth/api/v1/auth/`,
    zr: `${baseUrl}/zr/`,
  };
};

const logUrlStructure = () => {
  const urls = getBaseUrls();
  console.log('🔍 API URL Structure:', {
    baseUrl: getBaseUrl(),
    auth: urls.auth,
    authService: urls.authService,
    zr: urls.zr,
    environment: import.meta.env.MODE || 'unknown',
    hostname: window.location.hostname
  });
};

logUrlStructure();

const apiConfig = {
  getBaseUrl,
  getBaseUrls,
  logUrlStructure
};

export default apiConfig;
