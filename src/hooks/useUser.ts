// In ./src/hooks/useUser.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year' | null;
  // --- NEW FIELD ---
  metadata?: {
    installments?: string;
    type?: string;
  };
}

interface ContentCreator {
  id: string;
  nickname?: string;
  username: string;
  profileLink: string;
  instagram?: string;
  country: string;
  region?: { id: string; name: string; countryName: string; flag: string; };
  youtube?: string;
  followers?: number | null;
}
interface VisitedProfile {
  visitedAt: string | null;
  creator: ContentCreator;
}
interface SearchHistory {
  id: string;
  keyword?: string;
  country?: string;
  createdAt: string;
}
interface PasswordUpdateResponse {
  message: string;
}
interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId: string;
}

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string; // Add this
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: string;
  accountType: string;
  createdAt: string;
  searchHistory: SearchHistory[];
  totalSearchCount: number;
  visitedProfiles: VisitedProfile[];
  totalVisitsCount: number;
  hasPaid: boolean;
  // --- UPDATED STATUSES ---
  subscriptionStatus: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'LIFETIME_ACCESS';
  currentPeriodEnd: string | null;
  // --- NEW FIELDS ---
  installmentsPaid: number;
  installmentsRequired: number;
  stripeSubscriptionId?: string | null; 
  hotmartTransactionCode?: string | null;
  coursePurchases: { courseId: string }[];
  isCancellationScheduled?: boolean;
  planDetails?: {
    name: string;
    amount: number | null;
    currency: string;
    interval: 'month' | 'year' | 'day' | 'week' | 'one-time' | null;
  } | null;
  availableCourseDiscounts: number;
}

export const useGetSubscriptionPlans = (currency: 'eur' | 'usd' | 'aed') => {
  return useQuery<SubscriptionPlan[], AxiosError>({
    queryKey: ['subscriptionPlans', currency],
    queryFn: async () => {
      const response: AxiosResponse<SubscriptionPlan[]> = await apiClient.get('/payment/products', {
        params: { currency },
      });
      return response.data;
    },
    staleTime: 0, 
  });
};

export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiClient.get<User>('/profile/me'),
    enabled: isAuthenticated,
    select: (data: AxiosResponse<User>) => data.data,
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (passwordData: UpdatePasswordData) =>
      apiClient.patch<PasswordUpdateResponse>('/profile/update-password', passwordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert('Password updated successfully!');
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update password:', error);
      alert('Failed to update password. Please check your current password.');
    },
  });
};


export const useCreateCoursePaymentIntent = () => {
  return useMutation({
    mutationFn: async (data: { courseId: string; currency: 'eur' | 'usd' | 'aed'; applyAffiliateDiscount?: boolean }) => {
      return apiClient.post<{ clientSecret: string | null }>('/payment/create-course-payment-intent', data);
    },
    onError: () => {
      toast.error("Impossible de préparer le paiement. Veuillez réessayer.");
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData: UpdateProfileData) =>
      apiClient.patch<User>('/profile/me', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profil mis à jour avec succès !');
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { message?: string };
      toast.error(errorData?.message || 'Échec de la mise à jour du profil.');
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { priceId: string, paymentMethodId: string }) => {
      return apiClient.post<{
        status: 'requires_action' | 'active' | 'succeeded'; // Added 'succeeded' for one-time
        clientSecret?: string;
        subscriptionId?: string;
      }>('/payment/create-subscription', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { message?: string };
      toast.error(errorData?.message || "Échec de la transaction.");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/payment/cancel-subscription'),
    onSuccess: () => {
      toast.success("Votre abonnement sera annulé à la fin de la période de facturation.");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { message?: string };
      toast.error(errorData?.message || "Une erreur est survenue.");
    },
  });
};

export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/payment/reactivate-subscription'),
    onSuccess: () => {
      toast.success("Votre abonnement a été réactivé !");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { message?: string };
      toast.error(errorData?.message || "Une erreur est survenue.");
    },
  });
};