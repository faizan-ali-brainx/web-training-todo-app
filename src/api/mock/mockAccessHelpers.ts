import type { Todo } from '../../types';
import { db, MockApiError } from './mockDb';

// Shared owner/collaborator checks used by both mockTodosApi and
// mockCollaboratorsApi, mirroring the real backend's TodosService.

export function findTodoOrThrow(id: number): Todo {
  const todo = db.read().todos.find((t) => t.id === id);
  if (!todo) throw new MockApiError(404, `Todo ${id} not found`);
  return todo;
}

export function assertIsOwner(todo: Todo, userId: number): void {
  if (todo.userId !== userId) throw new MockApiError(403, 'Only the owner can do this');
}

// Owner always has access; otherwise the caller must be an invited collaborator.
export function assertCanAccess(todo: Todo, userId: number): void {
  if (todo.userId === userId) return;
  const isCollaborator = db.read().collaborators.some((c) => c.todoId === todo.id && c.userId === userId);
  if (!isCollaborator) throw new MockApiError(403, 'You do not have access to this todo');
}
