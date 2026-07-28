import { apiClient } from '../../api/client';
import { USE_MOCK_TODOS_API } from '../../api/config';
import { mockCollaboratorsApi } from '../../api/mock/mockCollaboratorsApi';
import type { Collaborator, CollaboratorInvite } from '../../types';

// Collaboration rides the same mock/real switch as todosApi, since it's part
// of the same Todo domain — see todosApi.ts for why the token is threaded
// through explicitly even though the real branch relies on apiClient's
// interceptor instead.
export const collaboratorsApi = {
  list(token: string, todoId: number): Promise<Collaborator[]> {
    return USE_MOCK_TODOS_API
      ? mockCollaboratorsApi.list(token, todoId)
      : apiClient.get<Collaborator[]>(`/todos/${todoId}/collaborators`).then((res) => res.data);
  },
  invite(token: string, todoId: number, email: string): Promise<CollaboratorInvite> {
    return USE_MOCK_TODOS_API
      ? mockCollaboratorsApi.invite(token, todoId, email)
      : apiClient
          .post<CollaboratorInvite>(`/todos/${todoId}/collaborators`, { email })
          .then((res) => res.data);
  },
  remove(token: string, todoId: number, userId: number): Promise<void> {
    return USE_MOCK_TODOS_API
      ? mockCollaboratorsApi.remove(token, todoId, userId)
      : apiClient.delete(`/todos/${todoId}/collaborators/${userId}`).then(() => undefined);
  },
};
