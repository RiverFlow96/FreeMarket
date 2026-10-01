import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_REFRESH_THRESHOLD_MINUTES = 5;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { getAccessToken, isTokenExpiringSoon, refreshAccessToken, logout } = useAuthStore.getState();
    const token = getAccessToken();

    if (token) {
      if (isTokenExpiringSoon(TOKEN_REFRESH_THRESHOLD_MINUTES)) {
        console.log('[API] Token expiring soon, attempting proactive refresh');

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const newToken = useAuthStore.getState().getAccessToken();
              processQueue(null, newToken);
              console.log('[API] Proactive token refresh successful');
            } else {
              console.error('[API] Proactive token refresh failed');
              processQueue(new AxiosError('Token refresh failed'), null);
              logout();
            }
          } catch (error) {
            console.error('[API] Token refresh error:', error);
            processQueue(error as AxiosError, null);
            logout();
          } finally {
            isRefreshing = false;
          }
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          });
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[API] Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    console.log('[API] Response error:', error.message, 'Status:', error.response?.status);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('[API] Handling 401, attempting token refresh');

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const { refreshAccessToken, logout } = useAuthStore.getState();
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            const newToken = useAuthStore.getState().getAccessToken();
            console.log('[API] Token refresh successful, retrying request');

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            return api(originalRequest);
          } else {
            console.error('[API] Token refresh failed, logging out');
            processQueue(error, null);
            logout();
          }
        } catch (refreshError) {
          console.error('[API] Token refresh error:', refreshError);
          processQueue(refreshError as AxiosError, null);
          useAuthStore.getState().logout();
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
