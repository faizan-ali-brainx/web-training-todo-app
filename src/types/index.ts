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
