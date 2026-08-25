import Cookies from 'js-cookie';
import { User } from './types';

const TOKEN_KEY = 'keuangan_jwt_token';
const USER_KEY = 'keuangan_user_data';

export const auth = {
  getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || undefined;
  },

  setToken(token: string) {
    Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed && parsed.name) return parsed;
      } catch {}
    }
    // Decode JWT Payload fallback
    const token = auth.getToken();
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedJson = JSON.parse(atob(payloadBase64));
          const userObj: User = {
            id: decodedJson.user_id || '',
            name: decodedJson.name || 'User',
            email: decodedJson.email || '',
          };
          localStorage.setItem(USER_KEY, JSON.stringify(userObj));
          return userObj;
        }
      } catch {}
    }
    return null;
  },

  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  removeSession() {
    Cookies.remove(TOKEN_KEY, { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!auth.getToken();
  }
};
