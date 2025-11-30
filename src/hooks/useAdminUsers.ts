// src/hooks/useAdminUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

export interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'INCOMPLETE' | 'LIFETIME_ACCESS';
    installmentsPaid: number;
    installmentsRequired: number;
    createdAt: string;
    stripeCustomerId: string | null;
}

// NEW: Filter Interface
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

// MODIFIED: Accept object instead of just search string
export const useAdminUsers = (page: number, filters: UserFilters) => {
    return useQuery<UsersResponse>({
        queryKey: ['adminUsers', page, filters], // Include filters in key to trigger refetch
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