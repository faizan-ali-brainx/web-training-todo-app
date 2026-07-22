import axios, { type AxiosError } from 'axios';
import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from './config';

// Thrown by the real API layer on any failed request — same role as the mock
// API's MockApiError, so callers (thunks, pages) handle both identically via
// `(err as Error).message`.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractMessage(data: unknown): string {
  const message = (data as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return 'Something went wrong';
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
    const status = error.response?.status ?? 500;
    return Promise.reject(new ApiError(status, extractMessage(error.response?.data)));
  }
);
