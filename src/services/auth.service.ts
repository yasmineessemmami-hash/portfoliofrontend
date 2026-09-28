import apiClient from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AdminInfo {
  id: number;
  name: string;
  email: string;
}

const TOKEN_KEY = "admin_token";

class AuthService {
  /**
   * Login admin user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post("/admin/auth/login", credentials);
    const data = response.data as LoginResponse;

    // Store token (backend uses 'access_token' instead of 'token')
    this.setToken(data.access_token);

    return data;
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/admin/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      this.removeToken();
    }
  }

  /**
   * Get current admin info
   */
  async getMe(): Promise<AdminInfo> {
    const response = await apiClient.post("/admin/auth/me");
    // Backend returns admin data directly, not wrapped in 'data'
    return response.data as AdminInfo;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Store token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Remove token
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
