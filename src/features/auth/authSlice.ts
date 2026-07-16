import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ACCESS_TOKEN_STORAGE_KEY } from '../../api/config';
import type { AuthSession, User } from '../../types';
import type { RootState } from '../../app/store';
import { authApi, type LoginDto, type SignupDto } from './authApi';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'loading', // starts loading — rehydrateSession settles it on app mount
  error: null,
};

export const signup = createAsyncThunk('auth/signup', async (dto: SignupDto) => {
  return authApi.signup(dto);
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token: string) => {
  await authApi.verifyEmail(token);
});

export const login = createAsyncThunk('auth/login', async (dto: LoginDto): Promise<AuthSession> => {
  const session = await authApi.login(dto);
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
  return session;
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email: string) => {
  return authApi.forgotPassword(email);
});

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }: { token: string; newPassword: string }) => {
    await authApi.resetPassword(token, newPassword);
  }
);

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  'auth/logout',
  async (_, { getState }) => {
    const { accessToken } = getState().auth;
    if (accessToken) await authApi.logout(accessToken);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
);

// Runs once on app mount — restores the session from a stored token, or
// settles immediately if there isn't one. Keeps status 'loading' until this
// resolves so ProtectedRoute doesn't redirect based on a not-yet-checked session.
export const rehydrateSession = createAsyncThunk(
  'auth/rehydrate',
  async (): Promise<AuthSession | null> => {
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) return null;

    try {
      const user = await authApi.getCurrentUser(token);
      return { user, accessToken: token };
    } catch (err) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      throw err;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'idle';
        state.error = null;
      })

      .addCase(rehydrateSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(rehydrateSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        } else {
          state.user = null;
          state.accessToken = null;
        }
      })
      .addCase(rehydrateSession.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
      });
  },
});

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.user !== null && state.auth.accessToken !== null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
