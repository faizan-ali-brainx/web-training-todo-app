import type { Todo } from '../../types';
import { assertCanAccess, assertIsOwner, findTodoOrThrow } from './mockAccessHelpers';
import { getUserIdFromToken } from './mockAuthApi';
import { db, delay } from './mockDb';

export interface CreateTodoDto {
  title: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
}

// Mock implementation of the todos CRUD endpoints. Ownership is strict for
// title edits/delete; completed-toggling and reads are also open to
// collaborators, mirroring the real backend's Part 2 access rules.
export const mockTodosApi = {
  async getAll(token: string): Promise<Todo[]> {
    await delay();
    const userId = getUserIdFromToken(token);
    const state = db.read();
    const collaboratingOn = new Set(
      state.collaborators.filter((c) => c.userId === userId).map((c) => c.todoId)
    );
    return state.todos.filter((t) => t.userId === userId || collaboratingOn.has(t.id));
  },

  async create(token: string, dto: CreateTodoDto): Promise<Todo> {
    await delay(400);
    const userId = getUserIdFromToken(token);

    let created!: Todo;
    db.write((s) => {
      created = {
        id: s.nextTodoId++,
        userId,
        title: dto.title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      s.todos.push(created);
    });

    return created;
  },

  async update(token: string, id: number, dto: UpdateTodoDto): Promise<Todo> {
    await delay(300);
    const userId = getUserIdFromToken(token);
    const todo = findTodoOrThrow(id);
    if (dto.title !== undefined) {
      assertIsOwner(todo, userId);
    } else {
      assertCanAccess(todo, userId);
    }

    let updated!: Todo;
    db.write((s) => {
      s.todos = s.todos.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...dto };
        return updated;
      });
    });

    return updated;
  },

  async remove(token: string, id: number): Promise<void> {
    await delay(300);
    const userId = getUserIdFromToken(token);
    const todo = findTodoOrThrow(id);
    assertIsOwner(todo, userId);

    db.write((s) => {
      s.todos = s.todos.filter((t) => t.id !== id);
    });
  },
};
