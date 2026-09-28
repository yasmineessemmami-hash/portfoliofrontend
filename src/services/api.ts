import axios from "axios";

// Backend base URL and API base path from environment variables
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH;

// Compose the final base URL safely (no trailing/duplicated slashes)
const normalizedBackendUrl = BACKEND_BASE_URL?.replace(/\/+$/, "") ?? "";
const normalizedApiPath = API_BASE_PATH
  ? API_BASE_PATH.startsWith("/")
    ? API_BASE_PATH
    : `/${API_BASE_PATH}`
  : "";

const API_BASE_URL = `${normalizedBackendUrl}${normalizedApiPath}`;

/**
 * Utility function to get the API base URL from environment variables
 * This ensures all API calls use the same backend URL configuration
 * @returns The complete API base URL (backend URL + API path)
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Utility function to get the backend base URL from environment variables
 * @returns The backend base URL without the API path
 */
export function getBackendBaseUrl(): string {
  return normalizedBackendUrl;
}

// Centralized axios instance configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor (adds JWT token to requests)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handles authentication errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    // Don't automatically redirect here - let the AuthContext handle it
    // This prevents premature redirects during checkAuth()
    return Promise.reject(error);
  }
);

export default apiClient;
