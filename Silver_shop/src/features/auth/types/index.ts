export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isVerifiedEmail: boolean;
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
}

export interface VerifyEmailValues {
  token: string;
  id: string;
}

export interface VerifyLinkParams {
  token: string;
  id: string;
}