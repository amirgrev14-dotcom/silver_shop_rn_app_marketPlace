const FALLBACK_API_URL = 'https://silver-shop-rn-app-marketplace.onrender.com/api';
// Both fallbacks point at the Render production hosts so the app works
// out of the box. For local dev against your own backend, override with
// EXPO_PUBLIC_PRODUCTS_URL / EXPO_PUBLIC_CART_URL (LAN IP on a phone).
const FALLBACK_PRODUCTS_URL = 'https://silver-shop-rn-app-marketplace-9lk1.onrender.com/api';
const FALLBACK_CART_URL = 'https://silver-shop-rn-app-marketplace-1.onrender.com/api';

// EXPO_PUBLIC_* vars are inlined by Expo at runtime; the legacy names
// are kept as a fallback for existing .env files.
const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || process.env.AUTH_SERVICE?.trim();
const rawProductsUrl =
  process.env.EXPO_PUBLIC_PRODUCTS_URL?.trim() || process.env.PRODUCT_SERVICE?.trim();

const rawCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const rawUploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
const rawCartUrl =
  process.env.EXPO_PUBLIC_CART_URL?.trim() || process.env.CART_SERVICE?.trim();
const rawPaymentProvider = process.env.EXPO_PUBLIC_PAYMENT_PROVIDER?.trim();

export const environment = {
  apiUrl: (rawApiUrl || FALLBACK_API_URL).replace(/\/+$/, ''),
  productsUrl: (rawProductsUrl || FALLBACK_PRODUCTS_URL).replace(/\/+$/, ''),
  cartUrl: (rawCartUrl || FALLBACK_CART_URL).replace(/\/+$/, ''),
  // 'mock' = free test provider (no keys); 'stripe' = real PaymentSheet.
  paymentProvider: rawPaymentProvider === 'stripe' ? 'stripe' : 'mock',
  cloudinary: {
    cloudName: rawCloudName || '',
    uploadPreset: rawUploadPreset || '',
  },
} as const;
