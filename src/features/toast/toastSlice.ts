import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastMessage[];
  nextId: number;
}

const initialState: ToastState = {
  items: [],
  nextId: 1,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<{ message: string; variant: ToastVariant }>) {
        state.items.push({ id: state.nextId++, ...action.payload });
      },
      prepare(payload: { message: string; variant: ToastVariant }) {
        return { payload };
      },
    },
    dismissToast(state, action: PayloadAction<number>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;

export const selectToasts = (state: RootState) => state.toast.items;
