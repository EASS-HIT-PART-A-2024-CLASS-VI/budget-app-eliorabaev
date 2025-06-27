// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterData, User, AuthContextType } from '../types/auth.types';
import { QUERY_KEYS } from '../utils/constants';

export const useAuth = (): AuthContextType => {
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.AUTH.CURRENT_USER,
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(), // Only run if token exists
    retry: false, // Don't retry on 401 errors
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(QUERY_KEYS.AUTH.CURRENT_USER, data.user);
      
      // Invalidate and refetch any cached data
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      // Error is handled by the component using this hook
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (userData) => {
      // Registration successful - component will handle navigation
      console.log('Registration successful for user:', userData.username);
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      // Error is handled by the component using this hook
    },
  });

  // Logout function
  const logout = () => {
    // Clear user data from cache
    queryClient.setQueryData(QUERY_KEYS.AUTH.CURRENT_USER, null);
    
    // Clear all cached data
    queryClient.clear();
    
    // Remove token from cookies
    authService.logout();
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      loginMutation.mutate(credentials, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    return new Promise((resolve, reject) => {
      registerMutation.mutate(userData, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  // Determine if user is authenticated
  const isAuthenticated = !!user && authService.isAuthenticated();

  // Get error message
  const getErrorMessage = () => {
    if (loginMutation.error) {
      const error = loginMutation.error as any;
      return error.response?.data?.detail || error.message || 'Login failed';
    }
    if (registerMutation.error) {
      const error = registerMutation.error as any;
      return error.response?.data?.detail || error.message || 'Registration failed';
    }
    if (error) {
      const authError = error as any;
      return authError.response?.data?.detail || authError.message || 'Authentication error';
    }
    return null;
  };

  return {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    error: getErrorMessage(),
  };
};