import axios from 'axios';
import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from './config';

// Not used while USE_MOCK_API is true — wired up now so the Day 5 swap to the
// real NestJS API only means pointing each feature's *Api.ts at these calls.
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);
