import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import collaboratorsReducer from '../features/todos/collaboratorsSlice';
import todosReducer from '../features/todos/todosSlice';
import toastReducer from '../features/toast/toastSlice';

// The single Redux store for the app — every feature slice is registered here.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
    collaborators: collaboratorsReducer,
    notifications: notificationsReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
