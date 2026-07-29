import { apiClient } from '../../api/client';
import { USE_MOCK_TODOS_API } from '../../api/config';
import { mockNotificationsApi } from '../../api/mock/mockNotificationsApi';
import type { AppNotification } from '../../types';

// Notifications ride the same mock/real switch as todos — same Todo domain,
// same backend. The real branch relies on apiClient's auth interceptor; the
// token is threaded through only for symmetry with the mock (see todosApi.ts).
export const notificationsApi = {
  getAll(token: string): Promise<AppNotification[]> {
    return USE_MOCK_TODOS_API
      ? mockNotificationsApi.getAll(token)
      : apiClient.get<AppNotification[]>('/notifications').then((res) => res.data);
  },
  markRead(token: string, id: number): Promise<AppNotification> {
    return USE_MOCK_TODOS_API
      ? mockNotificationsApi.markRead(token, id)
      : apiClient
          .patch<AppNotification>(`/notifications/${id}/read`)
          .then((res) => res.data);
  },
};
