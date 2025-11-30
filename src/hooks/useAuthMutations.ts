import { useMutation } from '@tanstack/react-query';
import { type AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

interface AuthCredentials { email: string; password: string; }
interface SignupData extends AuthCredentials { firstName: string; lastName: string; refCode?: string; }
interface AuthResponse { token: string; user: any; }

// Helper to determine redirect path
const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const offer = params.get('offer');

    if (redirect) {
        return decodeURIComponent(redirect);
    } 
    if (offer) {
        return `/dashboard/billing?offer=${offer}`;
    }
    return '/dashboard';
};

export const useLogin = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      apiClient.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (data: AxiosResponse<AuthResponse>) => {
      if (data.data.token) {
        login(data.data.token, getRedirectPath());
      }
    },
    onError: (error: AxiosError) => { console.error('Login failed:', error); },
  });
};

export const useSignup = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (userData: SignupData) =>
      apiClient.post<AuthResponse>('/auth/signup', userData),
    onSuccess: (data: AxiosResponse<AuthResponse>) => {
      if (data.data.token) {
        login(data.data.token, getRedirectPath());
      }
    },
  });
};