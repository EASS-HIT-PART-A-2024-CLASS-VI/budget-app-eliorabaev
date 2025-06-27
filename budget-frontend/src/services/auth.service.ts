// src/services/auth.service.ts
import { apiClient } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';
import { API_ENDPOINTS } from '../utils/constants';
import Cookies from 'js-cookie';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store the token in httpOnly cookie
    if (response.data.access_token) {
      Cookies.set('access_token', response.data.access_token, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    
    return response.data;
  },

  // Register new user
  async register(userData: RegisterData): Promise<User> {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data;
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Logout user
  logout(): void {
    // Remove token from cookies
    Cookies.remove('access_token');
    
    // Clear any cached data in sessionStorage
    sessionStorage.clear();
    
    // Optional: make API call to backend logout endpoint
    // This is useful for token blacklisting on the server side
    try {
      apiClient.post('/auth/logout').catch(() => {
        // Ignore errors - user is logging out anyway
      });
    } catch {
      // Ignore errors
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get('access_token');
    return !!token;
  },

  // Get current token
  getToken(): string | undefined {
    return Cookies.get('access_token');
  }
};