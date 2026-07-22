import { apiClient } from '../../api/client';
import { USE_MOCK_AUTH_API } from '../../api/config';
import { mockAuthApi, type LoginDto, type SignupDto } from '../../api/mock/mockAuthApi';
import type { AuthSession, User } from '../../types';

export type { LoginDto, SignupDto };

export interface SignupResult {
  message: string;
  verificationToken?: string; // only present outside the backend's production mode
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string; // only present outside the backend's production mode
}

// Single swap point: every call here checks USE_MOCK_AUTH_API once. Slices/components
// only ever import from this file, never api/mock or apiClient directly.
export const authApi = {
  signup(dto: SignupDto): Promise<SignupResult> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.signup(dto)
      : apiClient.post<SignupResult>('/auth/signup', dto).then((res) => res.data);
  },
  verifyEmail(token: string): Promise<void> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.verifyEmail(token)
      : apiClient.post('/auth/verify-email', { token }).then(() => undefined);
  },
  login(dto: LoginDto): Promise<AuthSession> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.login(dto)
      : apiClient.post<AuthSession>('/auth/login', dto).then((res) => res.data);
  },
  logout(token: string): Promise<void> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.logout(token)
      : apiClient.post('/auth/logout').then(() => undefined);
  },
  getCurrentUser(token: string): Promise<User> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.getCurrentUser(token)
      : apiClient.get<User>('/auth/me').then((res) => res.data);
  },
  forgotPassword(email: string): Promise<ForgotPasswordResult> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.forgotPassword(email)
      : apiClient.post<ForgotPasswordResult>('/auth/forgot-password', { email }).then((res) => res.data);
  },
  resetPassword(token: string, newPassword: string): Promise<void> {
    return USE_MOCK_AUTH_API
      ? mockAuthApi.resetPassword(token, newPassword)
      : apiClient.post('/auth/reset-password', { token, newPassword }).then(() => undefined);
  },
};
