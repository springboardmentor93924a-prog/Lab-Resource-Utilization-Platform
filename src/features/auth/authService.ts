import axios from 'axios';
import type { UserProfile } from './types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserProfile['role'];
  department: string;
  institution: string;
};

export async function loginRequest(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data as { user: UserProfile; token: string };
}

export async function registerRequest(payload: RegisterPayload) {
  const response = await api.post('/auth/register', payload);
  return response.data as { user: UserProfile; token: string };
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
