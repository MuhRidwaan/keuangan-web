import axios, { AxiosError } from 'axios';
import { auth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ meta?: { message?: string } }>) => {
    if (error.response?.status === 401) {
      auth.removeSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    const errorMessage = error.response?.data?.meta?.message || error.message || 'Terjadi kesalahan sistem';
    return Promise.reject(new Error(errorMessage));
  }
);
