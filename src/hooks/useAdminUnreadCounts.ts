// src/hooks/useAdminUnreadCounts.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useUserProfile } from './useUser';

interface UnreadCounts {
    support: number;
    shopOrders: number;
    total: number;
}

/**
 * Hook to fetch unread counts for admin notification badges.
 * Only fetches if the user is an admin.
 * Polls every 15 seconds to keep badges up to date.
 */
export const useAdminUnreadCounts = () => {
    const { data: user } = useUserProfile();
    const isAdmin = user?.accountType === 'ADMIN';

    return useQuery<UnreadCounts>({
        queryKey: ['adminUnreadCounts'],
        queryFn: async () => {
            const response = await apiClient.get<UnreadCounts>('/admin/unread-counts');
            return response.data;
        },
        enabled: isAdmin,
        refetchInterval: 15000, // Poll every 15 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};
