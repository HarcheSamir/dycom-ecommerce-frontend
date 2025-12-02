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