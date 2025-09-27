import axios from 'axios';
import { ApiResponse, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string, phone?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/register', { name, email, password, phone });
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};
