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
  if (!relativePath) {
    console.warn("🚫 getMediaUrl called with null/empty path");
    return null;
  }
  
  // If it's already a full URL
  if (relativePath.startsWith('http')) {
    console.log(`✓ Path is already a complete URL: ${relativePath}`);
    return relativePath;
  }
  
  // Log what we're trying to do for debugging
  console.log(`🔍 Converting relative path: "${relativePath}" to absolute URL`);
  
  // Generate URL based on path format
  let finalUrl;
  
  // Handle different formats of image paths
  if (relativePath.startsWith('prizes/') && !relativePath.startsWith('media/prizes/')) {
    finalUrl = `${getBaseUrl()}/media/${relativePath}`;
    console.log(`📋 Generated media URL (prizes): ${finalUrl}`);
  } else if (relativePath.startsWith('media/')) {
    // If it already has media/ prefix, just add base URL
    finalUrl = `${getBaseUrl()}/${relativePath}`;
    console.log(`📋 Generated media URL (with media): ${finalUrl}`);
  } else {
    // Standard path with media prefix
    finalUrl = `${getBaseUrl()}/media/${relativePath}`;
    console.log(`📋 Generated standard media URL: ${finalUrl}`);
  }
  
  // Verify URL via fetch (for debugging purposes only)
  fetch(finalUrl, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        console.log(`✅ Verified URL exists: ${finalUrl}`);
      } else {
        console.warn(`⚠️ URL returned ${response.status}: ${finalUrl}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error verifying URL: ${finalUrl}`, error);
    });
  
  return finalUrl;
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
