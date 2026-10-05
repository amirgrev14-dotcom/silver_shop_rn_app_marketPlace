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
  logout: () => Promise<void>;
  setEmailVerified: (value?: boolean) => void;
  setUser: (user: User) => void;
  refresh: () => Promise<{ accessToken: string; refreshToken: string }>;
  restoreSession: () => Promise<void>;
};

export const useAppStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isVerifiedEmail: false,
  accessTokenExpiry: null,
  refreshInProgress: false,
  user: null,

  login: (accessToken: string, refreshToken: string, user: User) => {
    void tokenStorage.setTokens(accessToken, refreshToken).catch(() => {});

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

  setUser: (user: User) => {
    set({
      user,
      isVerifiedEmail: user.isVerifiedEmail ?? get().isVerifiedEmail,
    });
  },

  refresh: async () => {
    set({ refreshInProgress: true });

    try {
      const { accessToken, refreshToken: newRefreshToken } = await refreshTokenRequest();

      const currentUser = get().user;
      if (currentUser) {
        get().login(accessToken, newRefreshToken, currentUser);
      } else {
        await tokenStorage.setTokens(accessToken, newRefreshToken);
      }

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      await get().logout().catch(() => {});
      throw error;
    } finally {
      set({ refreshInProgress: false });
    }
  },

  restoreSession: async () => {
    const accessToken = await tokenStorage.getAccess();
    const storedRefreshToken = await tokenStorage.getRefresh();

    if (accessToken && storedRefreshToken) {
      try {
        const { user } = await getMe();
        get().login(accessToken, storedRefreshToken, user);
      } catch {
        await get().logout().catch(() => {});
      }
    } else {
      await get().logout().catch(() => {});
    }
  },
}));