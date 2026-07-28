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
