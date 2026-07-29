import { useEffect } from 'react';
import { USE_MOCK_TODOS_API } from '../../api/config';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { AppNotification } from '../../types';
import { runWithToast } from '../toast/runWithToast';
import { connectNotifications } from './notificationsSocket';
import {
  fetchNotifications,
  markNotificationRead,
  notificationReceived,
  selectNotifications,
  selectUnreadCount,
} from './notificationsSlice';

interface UseNotifications {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: number) => void;
}

// Controller for the notification bell: loads the list on mount, subscribes to
// real-time pushes (real API only — the mock has no socket), and exposes the
// data plus a mark-read action to the view. MVC: this is the "controller" that
// keeps NotificationBell a pure view.
export function useNotifications(): UseNotifications {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const token = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (USE_MOCK_TODOS_API || !token) return;
    return connectNotifications(token, (n) => dispatch(notificationReceived(n)));
  }, [dispatch, token]);

  // Mutation → toast on failure only (success is obvious from the badge/row).
  const markRead = (id: number) =>
    void runWithToast(dispatch, () => dispatch(markNotificationRead(id)).unwrap());

  return { notifications, unreadCount, markRead };
}
