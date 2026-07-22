import type { Todo } from '../../types';

interface StoredUser {
  id: number;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
}

interface MockDbShape {
  users: StoredUser[];
  todos: Todo[];
  sessions: Record<string, number>; // accessToken -> userId
  verificationTokens: Record<string, number>; // token -> userId
  resetTokens: Record<string, number>; // token -> userId
  nextUserId: number;
  nextTodoId: number;
}

const STORAGE_KEY = 'react-sample-app:mockdb';

function seed(): MockDbShape {
  return {
    users: [],
    todos: [],
    sessions: {},
    verificationTokens: {},
    resetTokens: {},
    nextUserId: 1,
    nextTodoId: 1,
  };
}

function load(): MockDbShape {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed();
  try {
    return JSON.parse(raw) as MockDbShape;
  } catch {
    return seed();
  }
}

function save(db: MockDbShape): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// localStorage-backed fake database — read/write always go through here so
// every mock endpoint sees the same persisted state across page reloads.
export const db = {
  read(): MockDbShape {
    return load();
  },
  write(updater: (db: MockDbShape) => void): MockDbShape {
    const current = load();
    updater(current);
    save(current);
    return current;
  },
};

export type { StoredUser, MockDbShape };

// Simulates real network latency so loading states are actually visible.
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Stand-in for a real signed token/id, since the mock never talks to a real auth server.
export function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Thrown by mock endpoints to carry an HTTP-style status code, mirroring how
// the real NestJS API's exceptions will map to response codes.
export class MockApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
