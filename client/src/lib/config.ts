// API configuration
export const API_BASE_URL = '/xpswap/api';

export const getApiUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
