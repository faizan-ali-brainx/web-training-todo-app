import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { AppNotification } from '../../types';
import { notificationsApi } from './notificationsApi';

interface NotificationsState {
  items: AppNotification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationsState = { items: [], status: 'idle', error: null };

function requireToken(state: RootState): string {
  const token = state.auth.accessToken;
  if (!token) throw new Error('Not authenticated');
  return token;
}

// Loads the current user's notifications (newest first, per the API).
export const fetchNotifications = createAsyncThunk<AppNotification[], void, { state: RootState }>(
  'notifications/fetch',
  async (_, { getState }) => notificationsApi.getAll(requireToken(getState()))
);

// Marks one notification read and returns the updated row.
export const markNotificationRead = createAsyncThunk<AppNotification, number, { state: RootState }>(
  'notifications/markRead',
  async (id, { getState }) => notificationsApi.markRead(requireToken(getState()), id)
);

function handleFetchPending(state: NotificationsState) {
  state.status = 'loading';
  state.error = null;
}

function handleFetchFulfilled(state: NotificationsState, action: PayloadAction<AppNotification[]>) {
  state.status = 'succeeded';
  state.items = action.payload;
}

function handleFetchRejected(state: NotificationsState, action: { error: { message?: string } }) {
  state.status = 'failed';
  state.error = action.error.message ?? 'Failed to load notifications';
}

function handleMarkReadFulfilled(state: NotificationsState, action: PayloadAction<AppNotification>) {
  state.items = state.items.map((n) => (n.id === action.payload.id ? action.payload : n));
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Real-time push from the WebSocket — prepend unless it's already known
    // (a later fetch could otherwise duplicate it).
    notificationReceived(state, action: PayloadAction<AppNotification>) {
      if (state.items.some((n) => n.id === action.payload.id)) return;
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, handleFetchPending)
      .addCase(fetchNotifications.fulfilled, handleFetchFulfilled)
      .addCase(fetchNotifications.rejected, handleFetchRejected)
      .addCase(markNotificationRead.fulfilled, handleMarkReadFulfilled);
  },
});

export const { notificationReceived } = notificationsSlice.actions;
export default notificationsSlice.reducer;

// The user's notifications, newest first.
export const selectNotifications = (state: RootState) => state.notifications.items;
// How many notifications are still unread — drives the bell's badge.
export const selectUnreadCount = (state: RootState) =>
  state.notifications.items.filter((n) => !n.read).length;
