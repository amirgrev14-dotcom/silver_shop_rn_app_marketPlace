const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const environment = {
  apiUrl: apiUrl?.trim() || undefined,
} as const;
