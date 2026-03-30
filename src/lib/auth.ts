// Simple client-side session auth
// Update CREDENTIALS to change login details.

export const CREDENTIALS = {
  email: 'zac@veblengroup.com.au',
  password: 'veblen2026',
};

const SESSION_KEY = 'vg_session';

export function login(email: string, password: string): boolean {
  if (
    email.trim().toLowerCase() === CREDENTIALS.email.toLowerCase() &&
    password === CREDENTIALS.password
  ) {
    localStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_KEY) === '1';
}
