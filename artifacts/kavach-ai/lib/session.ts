import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Session token store. Keeps an in-memory cache so the auth-token getter
 * registered with the API client can resolve synchronously fast, while
 * still persisting the token across app restarts via AsyncStorage.
 */

const TOKEN_KEY = "kv_token";

let cachedToken: string | null = null;
let hydrated = false;

/** Load the persisted token into the in-memory cache. Call once on startup. */
export async function loadToken(): Promise<string | null> {
  try {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  hydrated = true;
  return cachedToken;
}

/** Getter passed to the API client's setAuthTokenGetter. */
export async function getToken(): Promise<string | null> {
  if (!hydrated) return loadToken();
  return cachedToken;
}

export async function saveToken(token: string): Promise<void> {
  cachedToken = token;
  hydrated = true;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // best-effort persistence; in-memory cache still works for this session
  }
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  hydrated = true;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
