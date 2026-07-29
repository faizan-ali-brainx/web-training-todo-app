export interface User {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
  deadline: string | null; // ISO string, or null when no deadline is set
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

// A todo's collaborator is just a User (the backend's PublicUser shape) —
// aliased for readability at call sites.
export type Collaborator = User;

export interface CollaboratorInvite {
  id: number;
  todoId: number;
  invitedBy: number;
  createdAt: string;
  user: Collaborator;
}

// Matches the backend's NotificationType enum (Part 3).
export type NotificationType =
  | 'DEADLINE_REMINDER'
  | 'COLLABORATOR_INVITED'
  | 'TASK_UPDATED';

// An in-app notification — named `AppNotification` (not `Notification`) so it
// doesn't shadow the browser's global `Notification` type. Matches the
// backend's PublicNotification shape and the WebSocket `notification` payload.
export interface AppNotification {
  id: number;
  userId: number;
  todoId: number | null;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}
