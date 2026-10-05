import { create } from 'zustand';

import { tokenStorage } from '@/lib/storage/token-storage';
import { refreshToken, logout as logoutBackend, getMe } from '@/features/auth/services/auth-service';
import type { MarketplaceMode } from '@/features/marketplace/types';

type User = {
  id: string;
  name: string;
  email: string;
  isVerifiedEmail: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  isVerifiedEmail: boolean;
  accessTokenExpiry: number | null;
  refreshInProgress: boolean;
  user: User | null;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  setEmailVerified: (value?: boolean) => void;
  setUser: (user: User) => void;
  refresh: () => Promise<{ accessToken: string; refreshToken: string }>;
  restoreSession: () => Promise<void>;
};

type AppState = {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  isAuthenticated: boolean;
  isVerifiedEmail: boolean;
  accessTokenExpiry: number | null;
  refreshInProgress: boolean;
  user: User | null;
  mode: MarketplaceMode;
  setMode: (mode: MarketplaceMode) => void;

  login: AuthState['login'];
  logout: AuthState['logout'];
  setEmailVerified: AuthState['setEmailVerified'];
  setUser: (user: User) => void;
  refresh: AuthState['refresh'];
  restoreSession: AuthState['restoreSession'];
};

export const useAppStore = create<AppState>((set, get) => ({
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (value: boolean) =>
    set({ hasCompletedOnboarding: value }),

  // Auth state
  isAuthenticated: false,
  isVerifiedEmail: false,
  accessTokenExpiry: null,
  refreshInProgress: false,
  user: null,
  mode: 'buyer',
  setMode: (mode) => set({ mode }),

  login: (accessToken: string, refreshToken: string, user: User) => {
    // Fire-and-forget: zustand actions stay sync; SecureStore is the source
    // of truth and every httpClient request reads it lazily.
    void tokenStorage.setTokens(accessToken, refreshToken).catch(() => {});
    set({
      isAuthenticated: true,
      isVerifiedEmail: user.isVerifiedEmail ?? false,
      accessTokenExpiry: Date.now() + 15 * 60 * 1000,
      user,
    });
  },

  setUser: (user: User) => {
    set({
      user,
      isVerifiedEmail: user.isVerifiedEmail ?? get().isVerifiedEmail,
    });
  },

  setEmailVerified: (value = true) => {
    const user = get().user;
    set({
      isVerifiedEmail: value,
      user: user ? { ...user, isVerifiedEmail: value } : user,
    });
  },

  logout: async () => {
    await logoutBackend();
    await tokenStorage.clear();
    set({
      isAuthenticated: false,
      isVerifiedEmail: false,
      accessTokenExpiry: null,
      user: null,
    });
  },

  refresh: async () => {
    set({ refreshInProgress: true });
    try {
      const { accessToken, refreshToken: newRefreshToken } = await refreshToken();
      const currentUser = get().user;
      if (currentUser) {
        get().login(accessToken, newRefreshToken, currentUser);
      } else {
        // No user in memory (e.g. cold start) — persist the rotated pair;
        // the next getMe()/restoreSession hydrates the user.
        await tokenStorage.setTokens(accessToken, newRefreshToken);
      }
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      // Manual refresh with a dead refresh token → drop the session so
      // pull-to-refresh lands on login instead of spinning forever.
      await get().logout().catch(() => {});
      throw error;
    } finally {
      set({ refreshInProgress: false });
    }
  },

  restoreSession: async () => {
    const accessToken = await tokenStorage.getAccess();
    const refreshToken = await tokenStorage.getRefresh();

    if (accessToken && refreshToken) {
      try {
        const meResponse = await getMe();
        get().login(accessToken, refreshToken, meResponse.user);
      } catch {
        // Backend unreachable or profile failed → drop the session
        // instead of crashing with an uncaught rejection.
        // (Dead refresh token is already logged out by the interceptor;
        // this covers the first-load path before any query runs.)
        await get().logout().catch(() => {});
      }
    } else {
      await get().logout().catch(() => {});
    }
  },
}));