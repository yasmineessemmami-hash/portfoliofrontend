/**
 * Key Management Utility
 * 
 * Manages userKey and appKey with priority:
 * 1. URL query params (?u=...&a=...)
 * 2. localStorage
 * 3. Generate new keys and save to backend
 */

import apiClient from "../services/api";

export interface SessionKeys {
  userKey: string;
  appKey: string;
}

const STORAGE_KEY_USER = "userKey";
const STORAGE_KEY_APP = "appKey";

/**
 * Generate a random 4-letter key
 */
function generateRandomKey(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 4; i++) {
    key += letters[Math.floor(Math.random() * letters.length)];
  }
  return key;
}

/**
 * Get keys from URL query params
 */
function getKeysFromURL(): Partial<SessionKeys> {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const u = params.get("u");
  const a = params.get("a");

  return {
    userKey: u || undefined,
    appKey: a || undefined,
  };
}

/**
 * Get keys from localStorage
 */
function getKeysFromStorage(): Partial<SessionKeys> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return {
      userKey: localStorage.getItem(STORAGE_KEY_USER) || undefined,
      appKey: localStorage.getItem(STORAGE_KEY_APP) || undefined,
    };
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return {};
  }
}

/**
 * Save keys to localStorage
 */
function saveKeysToStorage(keys: SessionKeys): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY_USER, keys.userKey);
    localStorage.setItem(STORAGE_KEY_APP, keys.appKey);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/**
 * Store userKey in backend
 * Returns true if key was created, false if it already existed
 */
async function storeUserKey(userKey: string): Promise<boolean> {
  try {
    const response = await apiClient.post("/user", { userKey });
    // Backend returns success even if key exists, but we can check the message
    const message = response.data?.message || "";
    if (message.includes("already exists")) {
      return false; // Key already existed
    }
    return true; // Key was created
  } catch (error: any) {
    // If key already exists, that's okay - don't treat as error
    if (error.response?.status === 409 || error.response?.status === 422) {
      console.log("UserKey already exists in database");
      return false;
    }
    console.error("Failed to store userKey:", error);
    // Don't throw - continue even if storage fails
    return false;
  }
}

/**
 * Store appKey in backend
 * Returns true if key was created, false if it already existed
 */
async function storeAppKey(appKey: string): Promise<boolean> {
  try {
    const response = await apiClient.post("/app", { appKey });
    // Backend returns success even if key exists, but we can check the message
    const message = response.data?.message || "";
    if (message.includes("already exists")) {
      return false; // Key already existed
    }
    return true; // Key was created
  } catch (error: any) {
    // If key already exists, that's okay - don't treat as error
    if (error.response?.status === 409 || error.response?.status === 422) {
      console.log("AppKey already exists in database");
      return false;
    }
    console.error("Failed to store appKey:", error);
    // Don't throw - continue even if storage fails
    return false;
  }
}

/**
 * Initialize and get session keys
 * 
 * Priority:
 * 1. URL query params (?u=...&a=...)
 * 2. localStorage
 * 3. Generate new keys
 * 
 * If new keys are generated, they are:
 * - Saved to localStorage
 * - Stored in backend database
 */
export async function initializeKeys(): Promise<SessionKeys> {
  // Step 1: Check URL params
  const urlKeys = getKeysFromURL();
  
  if (urlKeys.userKey && urlKeys.appKey) {
    // Both keys from URL - save to localStorage and return
    const keys = {
      userKey: urlKeys.userKey,
      appKey: urlKeys.appKey,
    };
    saveKeysToStorage(keys);
    
    // Store in backend (async, don't wait)
    storeUserKey(keys.userKey).catch(() => {});
    storeAppKey(keys.appKey).catch(() => {});
    
    return keys;
  }

  // Step 2: Check localStorage
  const storageKeys = getKeysFromStorage();
  
  if (storageKeys.userKey && storageKeys.appKey) {
    // Both keys from localStorage - return them
    // Don't store them again - they already exist in DB
    return {
      userKey: storageKeys.userKey,
      appKey: storageKeys.appKey,
    };
  }

  // Step 3: Generate new keys
  const newUserKey = generateRandomKey();
  // Use default "UNKN" appKey if no 'a' param provided
  const newAppKey = urlKeys.appKey || storageKeys.appKey || "UNKN";
  
  const keys: SessionKeys = {
    userKey: newUserKey,
    appKey: newAppKey,
  };

  // Save to localStorage
  saveKeysToStorage(keys);

  // Store in backend (async, don't block)
  storeUserKey(keys.userKey).catch(() => {});
  storeAppKey(keys.appKey).catch(() => {});

  console.log("Generated new session keys:", keys);
  return keys;
}

/**
 * Get current keys from storage (synchronous)
 * Returns null if keys don't exist
 */
export function getCurrentKeys(): SessionKeys | null {
  const keys = getKeysFromStorage();
  if (keys.userKey && keys.appKey) {
    return keys as SessionKeys;
  }
  return null;
}

