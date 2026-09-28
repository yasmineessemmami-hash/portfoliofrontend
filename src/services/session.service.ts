import apiClient from "./api";

export interface SessionKeys {
  u: string;
  a: string;
}

class SessionService {
  private readonly STORAGE_KEY_U = "session_u";
  private readonly STORAGE_KEY_A = "session_a";

  /**
   * Get u and a keys from URL params
   */
  getKeysFromURL(): Partial<SessionKeys> {
    const params = new URLSearchParams(window.location.search);
    return {
      u: params.get("u") || undefined,
      a: params.get("a") || undefined,
    };
  }

  /**
   * Get u and a keys from localStorage
   */
  getKeysFromStorage(): Partial<SessionKeys> {
    return {
      u: localStorage.getItem(this.STORAGE_KEY_U) || undefined,
      a: localStorage.getItem(this.STORAGE_KEY_A) || undefined,
    };
  }

  /**
   * Save keys to localStorage
   */
  saveKeysToStorage(keys: SessionKeys): void {
    localStorage.setItem(this.STORAGE_KEY_U, keys.u);
    localStorage.setItem(this.STORAGE_KEY_A, keys.a);
  }

  /**
   * Initialize session - validates/generates keys with backend
   * Priority: URL params > localStorage > backend-generated
   */
  async initSession(): Promise<SessionKeys> {
    // Priority: URL params > localStorage
    const urlKeys = this.getKeysFromURL();
    const storageKeys = this.getKeysFromStorage();

    const u = urlKeys.u || storageKeys.u;
    const a = urlKeys.a || storageKeys.a;

    // Call backend to validate/generate keys
    const response = await apiClient.post("/session/init", {
      u,
      a,
    });

    const keys: SessionKeys = {
      u: response.data.data.u,
      a: response.data.data.a,
    };

    // Save final keys to localStorage
    this.saveKeysToStorage(keys);

    return keys;
  }

  /**
   * Get current keys from storage
   */
  getCurrentKeys(): SessionKeys | null {
    const keys = this.getKeysFromStorage();
    if (keys.u && keys.a) {
      return keys as SessionKeys;
    }
    return null;
  }

}

export default new SessionService();

