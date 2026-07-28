/** Every route path in the app, as a single source of truth (no raw string
 * literals scattered across AppRouter/guards/pages). */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  TODOS: '/todos',
} as const;
