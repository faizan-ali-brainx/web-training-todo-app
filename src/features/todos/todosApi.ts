import { apiClient } from '../../api/client';
import { USE_MOCK_TODOS_API } from '../../api/config';
import { mockTodosApi, type CreateTodoDto, type UpdateTodoDto } from '../../api/mock/mockTodosApi';
import type { Todo } from '../../types';

export type { CreateTodoDto, UpdateTodoDto };

// Every method takes the access token explicitly (thunks pull it from
// authSlice via getState()) rather than reading it from storage here, so this
// file stays a pure, easily-swappable data layer. The real branch doesn't use
// the token directly — apiClient's interceptor already attaches it from
// localStorage — but keeps the same signature as the mock for symmetry.
export const todosApi = {
  getAll(token: string): Promise<Todo[]> {
    return USE_MOCK_TODOS_API ? mockTodosApi.getAll(token) : apiClient.get<Todo[]>('/todos').then((res) => res.data);
  },
  create(token: string, dto: CreateTodoDto): Promise<Todo> {
    return USE_MOCK_TODOS_API
      ? mockTodosApi.create(token, dto)
      : apiClient.post<Todo>('/todos', dto).then((res) => res.data);
  },
  update(token: string, id: number, dto: UpdateTodoDto): Promise<Todo> {
    return USE_MOCK_TODOS_API
      ? mockTodosApi.update(token, id, dto)
      : apiClient.patch<Todo>(`/todos/${id}`, dto).then((res) => res.data);
  },
  remove(token: string, id: number): Promise<void> {
    return USE_MOCK_TODOS_API
      ? mockTodosApi.remove(token, id)
      : apiClient.delete(`/todos/${id}`).then(() => undefined);
  },
};
