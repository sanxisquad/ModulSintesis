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
 * Get the API endpoints
 */
const getBaseUrls = () => {
  const baseUrl = getBaseUrl();
  
  // Ensure we have consistency with trailing slashes
  return {
    auth: `${baseUrl}/auth/api/v1`,
    authService: `${baseUrl}/auth/api/v1/auth/`,
    zr: `${baseUrl}/zr`,
  };
};

/**
 * Get the complete media URL for a relative path
 */
const getMediaUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // If it's already a full URL
  if (relativePath.startsWith('http')) return relativePath;
  
  // If we're in development environment
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // Log what we're trying to do for debugging
  console.log(`Converting relative path: ${relativePath} to absolute URL`);
  
  // Handle both possible directory structures
  if (relativePath.startsWith('prizes/') && !relativePath.startsWith('media/prizes/')) {
    // If the image is directly in the 'prizes' directory at root
    return `${getBaseUrl()}/media/${relativePath}`;
  } else {
    // Standard path with media prefix
    return `${getBaseUrl()}/media/${relativePath}`;
  }
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
  getMediaUrl,
  logUrlStructure
};

export default apiConfig;
