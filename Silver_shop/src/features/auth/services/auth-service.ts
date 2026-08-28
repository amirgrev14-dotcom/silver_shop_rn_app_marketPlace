import { httpClient } from '@/services/http-client';
import type { ApiErrorPayload, AuthResponse, LoginFormValues, RegisterFormValues } from '@/features/auth/types';
import { tokenStorage } from '@/lib/storage/token-storage';

export async function register(values: RegisterFormValues): Promise<AuthResponse> {
  console.log("AUTH", values);

  const response = await httpClient.post('/api/auth/register', values);
  console.log("AUTH R", response);

  const data = response.data;

  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data as AuthResponse;
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const response = await httpClient.post('/api/auth/login', values);
  const data = response.data;

  // Backend sets refresh token as HTTP-only cookie; we also store a copy in SecureStore
  await tokenStorage.setTokens(data.accessToken, data.refreshToken);

  return data as AuthResponse;
}

export async function getMe(): Promise<{ user: { id: string; name: string; email: string } }> {
  const response = await httpClient.get('/api/auth/me');
  return response.data;
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = await tokenStorage.getRefresh();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await httpClient.post('/api/auth/refresh', {}, { withCredentials: true });

  await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
}

export async function logout(): Promise<void> {
  // Best-effort: call backend logout if reachable
  try {
    await httpClient.post('/api/auth/logout');
  } catch (e) {
    // Ignore errors — local cleanup happens regardless
  }

  await tokenStorage.clear();
}