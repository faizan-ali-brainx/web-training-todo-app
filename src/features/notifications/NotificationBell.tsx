import { useState } from 'react';
import type { AppNotification } from '../../types';
import { useNotifications } from './useNotifications';
import styles from './NotificationBell.module.scss';

interface NotificationRowProps {
  notification: AppNotification;
  onRead: (id: number) => void;
}

// One notification; clicking an unread one marks it read.
function NotificationRow({ notification, onRead }: NotificationRowProps) {
  const className = `${styles.row} ${notification.read ? '' : styles.unread}`;
  return (
    <li className={className} onClick={() => !notification.read && onRead(notification.id)}>
      <span className={styles.message}>{notification.message}</span>
      <span className={styles.time}>{new Date(notification.createdAt).toLocaleString()}</span>
    </li>
  );
}

interface NotificationListProps {
  notifications: AppNotification[];
  onRead: (id: number) => void;
}

// The dropdown body — either the list or an empty-state message.
function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return <p className={styles.empty}>No notifications yet.</p>;
  }
  return (
    <ul className={styles.list}>
      {notifications.map((n) => (
        <NotificationRow key={n.id} notification={n} onRead={onRead} />
      ))}
    </ul>
  );
}

// Bell button with an unread badge and a dropdown of recent notifications.
export function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.bell}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.panel}>
          <NotificationList notifications={notifications} onRead={markRead} />
        </div>
      )}
    </div>
  );
}
