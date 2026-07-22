// Per-feature swap flags: auth can go live against the real backend (Part 1
// is done) while todos stays on the mock API until the backend's TodosModule
// ships (Part 1 continued). Flip each independently via env vars.
export const USE_MOCK_AUTH_API = import.meta.env.VITE_USE_MOCK_AUTH_API !== 'false';
export const USE_MOCK_TODOS_API = import.meta.env.VITE_USE_MOCK_TODOS_API !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
export const ACCESS_TOKEN_STORAGE_KEY = 'react-sample-app:accessToken';
