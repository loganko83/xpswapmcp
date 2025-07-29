// Base URL for API calls
export const API_BASE_URL = import.meta.env.PROD 
  ? '/xpswap/api' 
  : 'http://localhost:5000/api';

// Helper function to get full API URL
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For absolute URLs, return as is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return path;
  }
  
  // For API paths, prepend base URL
  if (cleanPath.startsWith('api/')) {
    if (import.meta.env.PROD) {
      return `${API_BASE_URL}/${cleanPath.slice(4)}`;
    } else {
      return `http://localhost:5000/${cleanPath}`;
    }
  }
  
  // Default case
  return path;
}
