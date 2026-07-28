// Single switch point for the Day 5 swap: flip this (or set VITE_USE_MOCK_API=false)
// once the real NestJS API is ready. Nothing outside features/*/*.Api.ts should
// ever need to know which implementation is active.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
export const ACCESS_TOKEN_STORAGE_KEY = 'react-sample-app:accessToken';
