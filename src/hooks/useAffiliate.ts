// src/hooks/useAffiliate.ts
import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';

// --- NEW TYPE DEFINITIONS ---

interface ReferredUser {
    id: string;
    name: string;
    signedUpAt: string;
    hasPaid: boolean;
}

export interface AffiliateDashboardData {
    referralLink: string;
    discountPercentage: number;
    stats: {
        totalReferrals: number;
        paidReferrals: number;
        availableDiscounts: number;
    };
    referredUsers: ReferredUser[];
}

// --- HOOK FOR USER-FACING AFFILIATE DASHBOARD ---

/**
 * Fetches all data required for the affiliate dashboard.
 * This hook will fail if the user is not a paying customer, which should be handled by the component.
 */
export const useAffiliateDashboard = () => {
    return useQuery<AffiliateDashboardData, AxiosError>({
        queryKey: ['affiliateDashboard'],
        queryFn: async () => {
            const response: AxiosResponse<AffiliateDashboardData> = await apiClient.get('/affiliate/dashboard');
            return response.data;
        },
        // It's important to not retry on 403 Forbidden errors, as it means the user is not eligible.
        retry: (failureCount, error) => {
            if (error.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
    });
};