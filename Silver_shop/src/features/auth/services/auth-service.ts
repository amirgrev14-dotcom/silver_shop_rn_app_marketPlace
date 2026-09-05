import { isAxiosError } from 'axios';
import { httpClient } from '@/services/http-client';
import type { AuthResponse, AuthUser, LoginFormValues, RegisterFormValues, VerifyEmailValues } from '@/features/auth/types';
import { tokenStorage } from '@/lib/storage/token-storage';

/**
 * Backend envelope (verified live against
 * https://silver-shop-rn-app-marketplace.onrender.com):
 *   success → { success: true, data: { user, accessToken, refreshToken } }
 *   error   → { success: false, message: "User already exists" }
 * Some endpoints may return the payload flat, so both shapes are accepted.
 */
interface SuccessEnvelope {
  success: boolean;
  message?: string;
  data?: Record<string, any>;
}

function unwrap<T>(raw: any): T {
  if (raw && typeof raw === 'object' && 'data' in raw && 'success' in raw) {
    return (raw as SuccessEnvelope).data as T;
  }
  return raw as T;
}

function normalizeUser(raw: any): AuthUser {
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? ''),
    email: String(raw?.email ?? ''),
    // Backend has no boolean flag — verification is `emailVerifiedAt: Date | null`.
    // A non-null timestamp (or any legacy truthy alias) means verified.
    isVerifiedEmail:
      Boolean(
        raw?.isVerifiedEmail ?? raw?.isEmailVerified ?? raw?.emailVerified ?? raw?.verified
      ) || raw?.emailVerifiedAt != null,
  };
}

function toAuthResponse(raw: any): AuthResponse {
  const payload = unwrap<any>(raw);
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: normalizeUser(payload.user),
  };
}

/** Extracts a human-readable message from axios / envelope errors. */
export function toApiMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data: any = error.response?.data;
    if (data) {
      if (typeof data.message === 'string' && data.message) return data.message;
      if (typeof data.error === 'string' && data.error) return data.error;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        return typeof first === 'string' ? first : (first?.message ?? fallback);
      }
    }
    if (error.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (!error.response) return 'Cannot reach the server. Check your connection.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function register(values: RegisterFormValues): Promise<AuthResponse> {
  // Backend registerSchema requires confirmPassword === password.
  const payload = {
    name: values.name,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword,
  };

  try {
    const response = await httpClient.post('/auth/register', payload);

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Registration failed');
    }

    const auth = toAuthResponse(response.data);

    if (auth.accessToken && auth.refreshToken) {
      await tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    }

    return auth;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Registration failed'));
  }
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  try {
    const response = await httpClient.post('/auth/login', values);

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Login failed');
    }

    const auth = toAuthResponse(response.data);

    if (auth.accessToken && auth.refreshToken) {
      await tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    }

    return auth;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Login failed'));
  }
}

export async function getMe(): Promise<{ user: AuthUser }> {
  try {
    const response = await httpClient.get('/auth/me');
    const payload = unwrap<any>(response.data);
    return { user: normalizeUser(payload?.user ?? payload) };
  } catch (error) {
    throw new Error(toApiMessage(error, 'Failed to load profile'));
  }
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const storedRefresh = await tokenStorage.getRefresh();

  if (!storedRefresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await httpClient.post('/auth/refresh', {}, { withCredentials: true });
    const payload = unwrap<any>(response.data);

    const accessToken: string = payload.accessToken;
    // Some backends rotate only the access token; keep the stored one then.
    const nextRefresh: string = payload.refreshToken ?? storedRefresh;

    await tokenStorage.setTokens(accessToken, nextRefresh);

    return { accessToken, refreshToken: nextRefresh };
  } catch (error) {
    throw new Error(toApiMessage(error, 'Session refresh failed'));
  }
}

export async function logout(): Promise<void> {
  // Best-effort: call backend logout if reachable
  try {
    await httpClient.post('/auth/logout');
  } catch {
    // Ignore errors — local cleanup happens regardless
  }

  await tokenStorage.clear();
}

export interface VerifyEmailResult {
  email?: string;
  message: string;
}

export async function verifyEmail(values: VerifyEmailValues): Promise<any> {
  // New backend logic (email-verification/routes.ts):
  //   GET /auth/email-verification/check/:token/:id
  // Backend link carries `id` (user id); older links may use userId.
  const id = values.userId ?? (values as { id?: string }).id;
  if (!values.token || !id) {
    throw new Error('Verification link is invalid (missing token or id).');
  }
  try {
    const response = await httpClient.get(
      `/auth/email-verification/check/${encodeURIComponent(values.token)}/${encodeURIComponent(id)}`
    );

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Verification failed');
    }

    const message: string =
      response.data?.message ?? response.data?.data?.message ?? 'Email verified successfully';
    const email: string | undefined = response.data?.data?.email ?? response.data?.email;

    // Backend does not rotate tokens here; return message/email.
    // Spread raw payload so callers expecting AuthResponse tokens keep working when present.
    const payload = unwrap<any>(response.data);
    return {
      ...(payload ?? {}),
      email: email ?? payload?.email,
      message,
    };
  } catch (error) {
    throw new Error(toApiMessage(error, 'Verification failed'));
  }
}

export async function resendVerificationCode(email: string): Promise<{ message: string }> {
  // New backend logic: POST /auth/email-verification/send { email }
  try {
    const response = await httpClient.post('/auth/email-verification/send', { email });

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Resend failed');
    }

    return { message: response.data?.message ?? 'Verification email sent' };
  } catch (error) {
    throw new Error(toApiMessage(error, 'Resend failed'));
  }
}

/**
 * Extracts magic-link params from an incoming URL.
 * Accepts `token` (+ `userId` / `user_id` / `id`) from query string or hash.
 * Returns null when the URL carries no verification token.
 */
export function parseVerificationLink(url: string): VerifyEmailValues | null {
  try {
    const queryStart = url.indexOf('?');
    const hashStart = url.indexOf('#');
    const rawQuery =
      queryStart >= 0
        ? url.slice(queryStart + 1, hashStart >= 0 && hashStart > queryStart ? hashStart : undefined)
        : hashStart >= 0
          ? url.slice(hashStart + 1)
          : '';

    const params = new URLSearchParams(rawQuery);
    const token = params.get('token')?.trim();

    if (!token) return null;

    const userId =
      params.get('userId') ?? params.get('user_id') ?? params.get('user-id') ?? params.get('id') ?? undefined;

    return userId ? { token, userId } : { token };
  } catch {
    return null;
  }
}
