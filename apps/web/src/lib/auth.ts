const AUTH_TOKEN_KEY = "umkm_saas_auth_token";

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}