import { create } from 'zustand';
import { tokenStorage } from '@/lib/storage/token-storage';
import { refreshToken as refreshTokenRequest, logout as logoutBackend, getMe } from '@/features/auth/services/auth-service';

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

export const useAppStore = create<AuthState>((set, get) => ({
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

  setEmailVerified: (value = true) => {
    const user = get().user;
    set({
      isVerifiedEmail: value,
      user: user ? { ...user, isVerifiedEmail: value } : user,
    });
  },

  refresh: async () => {
    set({ refreshInProgress: true });

    try {
      const { accessToken, refreshToken: newRefreshToken } = await refreshTokenRequest();

      get().login(accessToken, newRefreshToken, get().user!);

      return { accessToken, refreshToken: newRefreshToken };
    } finally {
      set({ refreshInProgress: false });
    }
  },

  restoreSession: async () => {
    const accessToken = await tokenStorage.getAccess();
    const storedRefreshToken = await tokenStorage.getRefresh();

    if (accessToken && storedRefreshToken) {
      const { user } = await getMe();
      get().login(accessToken, storedRefreshToken, user);
    } else {
      get().logout();
    }
  },
}));