import { create } from 'zustand';
import { tokenStorage } from '@/lib/storage/token-storage';
import { refreshToken, logout as logoutBackend } from '@/features/auth/services/auth-service';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  isAuthenticated: boolean;
  accessTokenExpiry: number | null;
  refreshInProgress: boolean;
  user: User | null;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<{ accessToken: string; refreshToken: string }>;
  restoreSession: () => void;
};

export const useAppStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accessTokenExpiry: null,
  refreshInProgress: false,
  user: null,

  login: (accessToken: string, refreshToken: string, user: User) => {
    tokenStorage.setTokens(accessToken, refreshToken);

    set({
      isAuthenticated: true,
      accessTokenExpiry: Date.now() + 15 * 60 * 1000,
      user,
    });
  },

  logout: async () => {
    await logoutBackend();
    await tokenStorage.clear();
    set({
      isAuthenticated: false,
      accessTokenExpiry: null,
      user: null,
    });
  },

  refresh: async () => {
    set({ refreshInProgress: true });

    try {
      const { accessToken, refreshToken } = await refreshToken();

      get().login(accessToken, refreshToken, get().user!);

      return { accessToken, refreshToken };
    } finally {
      set({ refreshInProgress: false });
    }
  },

  restoreSession: async () => {
    const accessToken = await tokenStorage.getAccess();
    const refreshToken = await tokenStorage.getRefresh();

    if (accessToken && refreshToken) {
      const { data } = await getMe();
      get().login(accessToken, refreshToken, data.user);
    } else {
      get().logout();
    }
  },
}));