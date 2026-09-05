const FALLBACK_API_URL = 'https://silver-shop-rn-app-marketplace.onrender.com/api';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const environment = {
  apiUrl: (rawApiUrl || FALLBACK_API_URL).replace(/\/+$/, ''),
} as const;
