import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

export interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null; 
    subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'INCOMPLETE' | 'LIFETIME_ACCESS';
    installmentsPaid: number;
    installmentsRequired: number;
    createdAt: string;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    // New Rich Data
    ltv: number;
    // --- UPDATED: Array of payments instead of single string ---
    paymentHistory: {
        date: string;
        amount: number;
        currency: string;
    }[]; 
    // -----------------------------------------------------------
    referrer?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    stats: {
        referrals: number;
        purchases: number;
        searches: number;
    };
}

export interface DetailedAdminUser {
    user: AdminUser; // Reusing the existing type
    financials: {
        ltv: number;
        transactions: {
            id: string;
            amount: number;
            currency: string;
            status: string;
            createdAt: string;
            stripePaymentId?: string | null;
            stripeInvoiceId?: string | null;
        }[];
    };
    courses: {
        id: string;
        title: string;
        coverImageUrl: string;
        totalVideos: number;
        completedVideos: number;
        percentage: number;
        status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    }[];
    affiliate: {
        referredBy: string | null;
        referralsCount: number;
    }
}

export interface UserFilters {
    search: string;
    status: string;
    installments: string;
}

interface UsersResponse {
    data: AdminUser[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const useAdminUsers = (page: number, filters: UserFilters) => {
    return useQuery<UsersResponse>({
        queryKey: ['adminUsers', page, filters], 
        queryFn: async () => {
            const response = await apiClient.get('/admin/users', {
                params: {
                    page,
                    limit: 20,
                    search: filters.search,
                    status: filters.status,
                    installments: filters.installments
                }
            });
            return response.data;
        },
        staleTime: 1000 * 60, // Cache for 1 min
    });
};

export const useGrantLifetime = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => apiClient.put(`/admin/users/${userId}/grant-lifetime`),
        onSuccess: () => {
            toast.success('User granted Lifetime Access!');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: () => {
            toast.error('Failed to update user.');
        }
    });
};

export const useAdminUserDetails = (userId: string | undefined) => {
    return useQuery<DetailedAdminUser, Error>({
        queryKey: ['adminUserDetails', userId],
        queryFn: async () => {
            if (!userId) throw new Error("No User ID");
            const response = await apiClient.get(`/admin/users/${userId}/details`);
            return response.data;
        },
        enabled: !!userId
    });
};



export const useUpdateUserSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { userId: string, subscriptionStatus: string, installmentsPaid: number, installmentsRequired: number }) =>
            apiClient.put(`/admin/users/${data.userId}/subscription`, data),
        onSuccess: (_, variables) => {
            toast.success('User subscription details updated.');
            queryClient.invalidateQueries({ queryKey: ['adminUserDetails', variables.userId] });
        },
        onError: () => toast.error('Failed to update subscription details.')
    });
};

export const useSyncStripeSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { userId: string, stripeSubscriptionId: string }) =>
            apiClient.post(`/admin/users/${data.userId}/sync-subscription`, { stripeSubscriptionId: data.stripeSubscriptionId }),
        onSuccess: (_, variables) => {
            toast.success('Synced with Stripe successfully!');
            queryClient.invalidateQueries({ queryKey: ['adminUserDetails', variables.userId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to sync subscription.')
    });
};

export const useAddStripePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { userId: string, stripePaymentId: string }) =>
            apiClient.post(`/admin/users/${data.userId}/sync-payment`, { stripePaymentId: data.stripePaymentId }),
        onSuccess: (_, variables) => {
            toast.success('Transaction record added!');
            queryClient.invalidateQueries({ queryKey: ['adminUserDetails', variables.userId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to add payment.')
    });
};