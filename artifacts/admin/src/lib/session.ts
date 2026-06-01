let memoryToken: string | null = null;

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  const stored = localStorage.getItem("kv_admin_token");
  if (stored) {
    memoryToken = stored;
    return stored;
  }
  return null;
}

export function saveToken(token: string) {
  memoryToken = token;
  localStorage.setItem("kv_admin_token", token);
}

export function clearToken() {
  memoryToken = null;
  localStorage.removeItem("kv_admin_token");
}
