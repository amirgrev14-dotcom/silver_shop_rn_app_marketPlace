import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'marketplace.favorite_ids';
const MAX_SAVED = 100;

/** Favorite product ids, persisted locally (backend has no likes table yet). */
export const favoritesStorage = {
  async load(): Promise<string[]> {
    try {
      const raw = await SecureStore.getItemAsync(FAVORITES_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_SAVED)
        : [];
    } catch {
      return [];
    }
  },

  async save(ids: string[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(ids.slice(0, MAX_SAVED)));
    } catch {
      // Storage full/unavailable — favorites stay in memory for the session.
    }
  },
};
