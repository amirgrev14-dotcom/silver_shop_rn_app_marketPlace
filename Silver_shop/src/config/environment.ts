const FALLBACK_API_URL = 'https://silver-shop-rn-app-marketplace.onrender.com/api';
// Product service has no production host yet — local dev default.
// On a physical phone replace with your LAN IP, e.g.
// EXPO_PUBLIC_PRODUCTS_URL=http://192.168.1.10:3001/api
const FALLBACK_PRODUCTS_URL = 'http://localhost:3001/api';

// EXPO_PUBLIC_* vars are inlined by Expo at runtime; the legacy names
// are kept as a fallback for existing .env files.
const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || process.env.AUTH_SERVICE?.trim();
const rawProductsUrl =
  process.env.EXPO_PUBLIC_PRODUCTS_URL?.trim() || process.env.PRODUCT_SERVICE?.trim();

const rawCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const rawUploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

export const environment = {
  apiUrl: (rawApiUrl || FALLBACK_API_URL).replace(/\/+$/, ''),
  productsUrl: (rawProductsUrl || FALLBACK_PRODUCTS_URL).replace(/\/+$/, ''),
  cloudinary: {
    cloudName: rawCloudName || '',
    uploadPreset: rawUploadPreset || '',
  },
} as const;
