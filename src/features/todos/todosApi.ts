import { USE_MOCK_API } from '../../api/config';
import { mockTodosApi, type CreateTodoDto, type UpdateTodoDto } from '../../api/mock/mockTodosApi';
import type { Todo } from '../../types';

export type { CreateTodoDto, UpdateTodoDto };

function notImplemented(): never {
  throw new Error('Real todos API not implemented yet — arrives on Day 5');
}

// Every method takes the access token explicitly (thunks pull it from
// authSlice via getState()) rather than reading it from storage here, so this
// file stays a pure, easily-swappable data layer.
export const todosApi = {
  getAll(token: string): Promise<Todo[]> {
    return USE_MOCK_API ? mockTodosApi.getAll(token) : notImplemented();
  },
  create(token: string, dto: CreateTodoDto): Promise<Todo> {
    return USE_MOCK_API ? mockTodosApi.create(token, dto) : notImplemented();
  },
  update(token: string, id: number, dto: UpdateTodoDto): Promise<Todo> {
    return USE_MOCK_API ? mockTodosApi.update(token, id, dto) : notImplemented();
  },
  remove(token: string, id: number): Promise<void> {
    return USE_MOCK_API ? mockTodosApi.remove(token, id) : notImplemented();
  },
};
