// Base URL for API calls - 환경에 따라 자동 설정
export const API_BASE_URL = import.meta.env.PROD 
  ? '/xpswap/api'  // 프로덕션: Apache 프록시를 통해 /xpswap/api -> PM2 서버
  : '/api';        // 개발: Vite 프록시를 통해 /api -> localhost:5000

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
    const apiPath = cleanPath.slice(4); // Remove 'api/' prefix
    return `${API_BASE_URL}/${apiPath}`;
  }
  
  // If path doesn't start with 'api/', assume it's an API path
  return `${API_BASE_URL}/${cleanPath}`;
}
