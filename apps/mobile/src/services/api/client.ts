import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { API_URL, API_TIMEOUT } from '@/config/constants';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/services/storage/secure-store';
import type { AuthTokens, ApiResponse } from '@ahub/shared/types';

// Queue for failed requests during token refresh
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await getAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint directly (bypass interceptors)
        const response = await axios.post<ApiResponse<AuthTokens>>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newTokens = response.data.data;

        if (!newTokens) {
          throw new Error('Invalid refresh response');
        }

        // Save new tokens
        await setTokens(newTokens);

        // Update auth header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        // Process queued requests
        processQueue(null, newTokens.accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await clearTokens();
        processQueue(refreshError as Error);

        // Emit logout event (will be handled by AuthProvider)
        DeviceEventEmitter.emit('auth:logout');

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Type-safe request helpers
export async function get<T>(url: string, params?: object): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, { params });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
}

export async function post<T>(url: string, data?: object): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
}

export async function put<T>(url: string, data?: object): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
}

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Upload failed');
  }
  return response.data.data as T;
}

export async function patch<T>(url: string, data?: object): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, data);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
}

export default api;
