// File: ./src/hooks/useAuthMutations.ts
// CORRECTED VERSION

import { useMutation } from '@tanstack/react-query';
import { type AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

// Define types for the function arguments
interface AuthCredentials {
  email: string;
  password: string;
}

interface SignupData extends AuthCredentials {
  firstName: string;
  lastName: string;
  refCode?: string;
}

// Define the expected API response
interface AuthResponse {
  token: string;
  user: any; // User object
}

// ... useLogin hook remains unchanged ...
export const useLogin = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      apiClient.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (data: AxiosResponse<AuthResponse>) => {
      if (data.data.token) {
        login(data.data.token);
      }
    },
    onError: (error: AxiosError) => {
      console.error('Login failed:', error);
    },
  });
};


/**
 * Hook for handling user signup mutation.
 */
export const useSignup = () => {
  // --- CORRECTION START ---
  // We need the login function again
  const { login } = useAuth();

  return useMutation({
    mutationFn: (userData: SignupData) =>
      // The backend now returns AuthResponse on signup
      apiClient.post<AuthResponse>('/auth/signup', userData),
    onSuccess: (data: AxiosResponse<AuthResponse>) => {
      // Log the user in immediately after successful signup using the token from the response
      if (data.data.token) {
        login(data.data.token);
      }
    },
    // onError is now handled in the component for better user feedback
    // --- CORRECTION END ---
  });
};