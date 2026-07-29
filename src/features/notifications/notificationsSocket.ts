import { io, type Socket } from 'socket.io-client';
import { API_ORIGIN } from '../../api/config';
import type { AppNotification } from '../../types';

// The event name the backend gateway emits on (see NOTIFICATION_EVENT there).
const NOTIFICATION_EVENT = 'notification';

// Opens an authenticated Socket.io connection and calls `onNotification` for
// each pushed notification. Returns a cleanup function that unsubscribes and
// disconnects — the caller (useNotifications) runs it on unmount.
export function connectNotifications(
  token: string,
  onNotification: (notification: AppNotification) => void
): () => void {
  const socket: Socket = io(API_ORIGIN, { auth: { token } });
  socket.on(NOTIFICATION_EVENT, onNotification);

  return () => {
    socket.off(NOTIFICATION_EVENT, onNotification);
    socket.disconnect();
  };
}
