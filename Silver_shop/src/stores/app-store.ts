import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { tokenStorage } from '@/lib/storage/token-storage';
import { refreshToken, logout as logoutBackend, getMe } from '@/features/auth/services/auth-service';
import { environment } from '@/config/environment';

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
  logout: () => void;
  setEmailVerified: (value?: boolean) => void;
  refresh: () => Promise<{ accessToken: string; refreshToken: string }>;
  restoreSession: () => void;
};

type AppState = {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  isAuthenticated: boolean;
  isVerifiedEmail: boolean;
  accessTokenExpiry: number | null;
  refreshInProgress: boolean;
  user: User | null;

  login: AuthState['login'];
  logout: AuthState['logout'];
  setEmailVerified: AuthState['setEmailVerified'];
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

  login: (accessToken: string, refreshToken: string, user: User) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    set({
      isAuthenticated: true,
      isVerifiedEmail: user.isVerifiedEmail ?? false,
      accessTokenExpiry: Date.now() + 15 * 60 * 1000,
      user,
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
      get().login(accessToken, newRefreshToken, get().user!);
      return { accessToken, refreshToken: newRefreshToken };
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
        get().logout();
      }
    } else {
      get().logout();
    }
  },
}));