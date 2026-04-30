import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  isTokenExpiringSoon: (thresholdMinutes?: number) => boolean;
  setAccessToken: (token: string) => void;
}

function decodeJWT(token: string): { exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    console.error('[Auth] Error decoding JWT token');
    return null;
  }
}

const TOKEN_EXPIRY_BUFFER_MINUTES = 5;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      user: null,
      isAuthenticated: false,

      login: (accessToken, refreshToken, user) => {
        const decoded = decodeJWT(accessToken);
        const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;

        console.log('[Auth] Login successful, token expires at:', expiresAt ? new Date(expiresAt).toISOString() : 'unknown');

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          tokenExpiresAt: expiresAt
        });
      },

      logout: () => {
        console.log('[Auth] Logging out user');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          tokenExpiresAt: null
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (accessToken: string) => {
        const decoded = decodeJWT(accessToken);
        const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;

        console.log('[Auth] Token refreshed, new expiry:', expiresAt ? new Date(expiresAt).toISOString() : 'unknown');

        set({ accessToken, tokenExpiresAt: expiresAt });
      },

      getAccessToken: () => get().accessToken,

      isTokenExpiringSoon: (thresholdMinutes = TOKEN_EXPIRY_BUFFER_MINUTES) => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;

        const now = Date.now();
        const thresholdMs = thresholdMinutes * 60 * 1000;
        const isExpiring = tokenExpiresAt - now < thresholdMs;

        if (isExpiring) {
          console.log('[Auth] Token expiring soon', {
            expiresAt: new Date(tokenExpiresAt).toISOString(),
            now: new Date(now).toISOString(),
            minutesLeft: Math.round((tokenExpiresAt - now) / 60000)
          });
        }

        return isExpiring;
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;

        console.log('[Auth] Attempting to refresh access token');

        if (!refreshToken) {
          console.log('[Auth] No refresh token available');
          get().logout();
          return false;
        }

        try {
          const res = await fetch("/api/v1/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!res.ok) {
            console.error('[Auth] Token refresh failed with status:', res.status);
            get().logout();
            return false;
          }

          const data = await res.json();
          const decoded = decodeJWT(data.access);
          const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;

          console.log('[Auth] Token refresh successful, new expiry:', expiresAt ? new Date(expiresAt).toISOString() : 'unknown');

          set({ accessToken: data.access, isAuthenticated: true, tokenExpiresAt: expiresAt });
          return true;
        } catch (error) {
          console.error('[Auth] Token refresh error:', error);
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
