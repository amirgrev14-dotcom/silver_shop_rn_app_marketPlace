import * as SecureStore from 'expo-secure-store';
import { ACCESS_KEY, REFRESH_KEY } from './secure-keys';

export const tokenStorage = {
  async getAccess(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },

  async getRefresh(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async setTokens(access: string, refresh: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};