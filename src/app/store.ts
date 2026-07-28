import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';
import toastReducer from '../features/toast/toastSlice';

// The single Redux store for the app — every feature slice is registered here.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
