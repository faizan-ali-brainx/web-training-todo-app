import { USE_MOCK_API } from '../../api/config';
import { mockAuthApi, type LoginDto, type SignupDto } from '../../api/mock/mockAuthApi';
import type { AuthSession, User } from '../../types';

export type { LoginDto, SignupDto };

function notImplemented(): never {
  throw new Error('Real auth API not implemented yet — arrives on Day 5');
}

// Single swap point: every call here checks USE_MOCK_API once. Slices/components
// only ever import from this file, never api/mock directly.
export const authApi = {
  signup(dto: SignupDto): Promise<{ verificationToken: string }> {
    return USE_MOCK_API ? mockAuthApi.signup(dto) : notImplemented();
  },
  verifyEmail(token: string): Promise<void> {
    return USE_MOCK_API ? mockAuthApi.verifyEmail(token) : notImplemented();
  },
  login(dto: LoginDto): Promise<AuthSession> {
    return USE_MOCK_API ? mockAuthApi.login(dto) : notImplemented();
  },
  logout(token: string): Promise<void> {
    return USE_MOCK_API ? mockAuthApi.logout(token) : notImplemented();
  },
  getCurrentUser(token: string): Promise<User> {
    return USE_MOCK_API ? mockAuthApi.getCurrentUser(token) : notImplemented();
  },
  forgotPassword(email: string): Promise<{ resetToken: string }> {
    return USE_MOCK_API ? mockAuthApi.forgotPassword(email) : notImplemented();
  },
  resetPassword(token: string, newPassword: string): Promise<void> {
    return USE_MOCK_API ? mockAuthApi.resetPassword(token, newPassword) : notImplemented();
  },
};
