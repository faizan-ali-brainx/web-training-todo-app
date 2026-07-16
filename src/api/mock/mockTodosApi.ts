import type { Todo } from '../../types';
import { getUserIdFromToken } from './mockAuthApi';
import { db, delay, MockApiError } from './mockDb';

export interface CreateTodoDto {
  title: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
}

function findOwnedTodo(userId: number, id: number): Todo {
  const state = db.read();
  const todo = state.todos.find((t) => t.id === id);
  if (!todo) throw new MockApiError(404, `Todo ${id} not found`);
  if (todo.userId !== userId) throw new MockApiError(403, 'You do not own this todo');
  return todo;
}

export const mockTodosApi = {
  async getAll(token: string): Promise<Todo[]> {
    await delay();
    const userId = getUserIdFromToken(token);
    const state = db.read();
    return state.todos.filter((t) => t.userId === userId);
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
    findOwnedTodo(userId, id); // throws if missing/not owned

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
    findOwnedTodo(userId, id);

    db.write((s) => {
      s.todos = s.todos.filter((t) => t.id !== id);
    });
  },
};
