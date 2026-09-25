/** Bearer-token store shared by the http client (sync read, no React). */
const KEY = 'portfolio.auth.token';

let mem: string | null = null;
let loaded = false;

export function getAuthToken(): string | null {
  if (!loaded) {
    loaded = true;
    try {
      mem = window.localStorage.getItem(KEY);
    } catch {
      mem = null;
    }
  }
  return mem;
}

export function setAuthToken(token: string | null): void {
  mem = token;
  try {
    if (token === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, token);
  } catch {
    // storage unavailable — session just won't persist
  }
}
