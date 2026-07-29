import type { AppNotification, NotificationType } from '../../types';
import { getUserIdFromToken } from './mockAuthApi';
import { db, delay, MockApiError } from './mockDb';

interface NewNotification {
  userId: number;
  type: NotificationType;
  message: string;
  todoId?: number;
}

// Persists a notification into the mock DB — the mock stand-in for the backend
// raising one (e.g. on a collaborator invite). There's no socket in mock mode,
// so it only lands in the list; it isn't pushed in real time.
export function addMockNotification(input: NewNotification): AppNotification {
  let created!: AppNotification;
  db.write((s) => {
    created = {
      id: s.nextNotificationId++,
      userId: input.userId,
      todoId: input.todoId ?? null,
      type: input.type,
      message: input.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    s.notifications.push(created);
  });
  return created;
}

// Mock implementation of the notifications endpoints — mirrors the real
// backend's recipient-scoped list and mark-as-read rules.
export const mockNotificationsApi = {
  async getAll(token: string): Promise<AppNotification[]> {
    await delay(300);
    const userId = getUserIdFromToken(token);
    return db
      .read()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async markRead(token: string, id: number): Promise<AppNotification> {
    await delay(200);
    const userId = getUserIdFromToken(token);
    const existing = db.read().notifications.find((n) => n.id === id);
    if (!existing) throw new MockApiError(404, `Notification ${id} not found`);
    if (existing.userId !== userId) {
      throw new MockApiError(403, 'That notification belongs to someone else');
    }

    let updated!: AppNotification;
    db.write((s) => {
      s.notifications = s.notifications.map((n) =>
        n.id === id ? (updated = { ...n, read: true }) : n
      );
    });
    return updated;
  },
};
