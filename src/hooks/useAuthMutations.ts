import { useMutation } from '@tanstack/react-query';
import { type AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

interface AuthCredentials { email: string; password: string; }
interface SignupData extends AuthCredentials { firstName: string; lastName: string; refCode?: string; }

// Updated Response Interface
interface AuthResponse { 
    token?: string; 
    user?: any;
    requireOtp?: boolean; // Backend flag
    email?: string;       // Backend returns email for confirmation
}

interface VerifyOtpData {
    email: string;
    otp: string;
}

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

export const useLogin = (onOtpRequired?: (email: string) => void) => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      apiClient.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (response: AxiosResponse<AuthResponse>) => {
      const data = response.data;

      // 1. Check if OTP is required (Admin flow)
      if (data.requireOtp && data.email) {
          if (onOtpRequired) {
              onOtpRequired(data.email);
          }
          return; // Stop here, do not log in yet
      }

      // 2. Standard User flow
      if (data.token) {
        login(data.token, getRedirectPath());
      }
    },
    onError: (error: AxiosError) => { console.error('Login failed:', error); },
  });
};

export const useVerifyOtp = () => {
    const { login } = useAuth();

    return useMutation({
        mutationFn: (data: VerifyOtpData) => 
            apiClient.post<AuthResponse>('/auth/verify-otp', data),
        onSuccess: (response: AxiosResponse<AuthResponse>) => {
            if (response.data.token) {
                login(response.data.token, getRedirectPath());
            }
        },
        onError: (error: AxiosError) => { console.error('OTP Verification failed:', error); },
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


export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: { token: string; newPassword: string }) => 
            apiClient.post('/auth/reset-password', data),
    });
};