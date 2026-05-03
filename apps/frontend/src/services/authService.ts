import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

// Persist user identity to localStorage for client-side access.
function persistUser(user: User, token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
  localStorage.setItem('press_user', JSON.stringify(user));
}

// Read the stored user identity.
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('press_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  const { user, accessToken } = response.data.data;
  if (accessToken) persistUser(user, accessToken);
  return response.data;
};

export const register = async (email: string, password: string, full_name: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { email, password, full_name });
  const { user, accessToken } = response.data.data;
  if (accessToken) persistUser(user, accessToken);
  return response.data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('press_user');
  }
};

export default api;
