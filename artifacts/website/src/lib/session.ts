let memoryToken: string | null = null;

const STORAGE_KEY = "kv_web_token";

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    memoryToken = stored;
    return stored;
  }
  return null;
}

export function saveToken(token: string) {
  memoryToken = token;
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  memoryToken = null;
  localStorage.removeItem(STORAGE_KEY);
}
