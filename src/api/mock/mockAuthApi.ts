import type { AuthSession, User } from '../../types';
import { db, delay, generateToken, MockApiError, type StoredUser } from './mockDb';

export interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Strips the password before a user record ever leaves the mock "database".
function toPublicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified };
}

// Resolves the current user id from an access token — same role a JWT guard
// plays on the real NestJS API. Exported so mockTodosApi can enforce ownership.
export function getUserIdFromToken(token: string): number {
  const state = db.read();
  const userId = state.sessions[token];
  if (userId === undefined) {
    throw new MockApiError(401, 'Not authenticated');
  }
  return userId;
}

// Mock implementation of the auth endpoints (signup/login/verify/reset/logout).
// Mirrors the shape and status codes the real NestJS auth API will use.
export const mockAuthApi = {
  async signup(dto: SignupDto): Promise<{ message: string; verificationToken: string }> {
    await delay();
    const state = db.read();

    if (state.users.some((u) => u.email === dto.email)) {
      throw new MockApiError(409, 'An account with this email already exists');
    }

    const verificationToken = generateToken();
    db.write((s) => {
      const user: StoredUser = {
        id: s.nextUserId++,
        name: dto.name,
        email: dto.email,
        password: dto.password,
        emailVerified: false,
      };
      s.users.push(user);
      s.verificationTokens[verificationToken] = user.id;
    });

    return { message: 'Account created — check your email to verify.', verificationToken };
  },

  async verifyEmail(token: string): Promise<void> {
    await delay(300);
    const state = db.read();
    const userId = state.verificationTokens[token];
    if (userId === undefined) {
      throw new MockApiError(400, 'Invalid or expired verification link');
    }

    db.write((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (user) user.emailVerified = true;
      delete s.verificationTokens[token];
    });
  },

  async login(dto: LoginDto): Promise<AuthSession> {
    await delay();
    const state = db.read();
    const user = state.users.find((u) => u.email === dto.email);

    if (!user || user.password !== dto.password) {
      throw new MockApiError(401, 'Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new MockApiError(403, 'Please verify your email before logging in');
    }

    const accessToken = generateToken();
    db.write((s) => {
      s.sessions[accessToken] = user.id;
    });

    return { user: toPublicUser(user), accessToken };
  },

  async logout(token: string): Promise<void> {
    await delay(200);
    db.write((s) => {
      delete s.sessions[token];
    });
  },

  async getCurrentUser(token: string): Promise<User> {
    await delay(200);
    const userId = getUserIdFromToken(token);
    const state = db.read();
    const user = state.users.find((u) => u.id === userId);
    if (!user) throw new MockApiError(401, 'Not authenticated');
    return toPublicUser(user);
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken: string }> {
    await delay();
    const state = db.read();
    const user = state.users.find((u) => u.email === email);
    if (!user) {
      throw new MockApiError(404, 'No account found with this email');
    }

    const resetToken = generateToken();
    db.write((s) => {
      s.resetTokens[resetToken] = user.id;
    });

    return { message: 'A password reset link would be sent to your email.', resetToken };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await delay();
    const state = db.read();
    const userId = state.resetTokens[token];
    if (userId === undefined) {
      throw new MockApiError(400, 'Invalid or expired reset link');
    }

    db.write((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (user) user.password = newPassword;
      delete s.resetTokens[token];
    });
  },
};
