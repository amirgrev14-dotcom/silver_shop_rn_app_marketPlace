export interface ApiErrorPayload {
  code: string;
  message: string;
}

export type BackendRole = 'BUYER' | 'SELLER' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isVerifiedEmail: boolean;
  role: BackendRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'buyer' | 'seller';
}

export interface VerifyEmailValues {
  token: string;
  id: string;
}

export interface VerifyLinkParams {
  token: string;
  id: string;
}