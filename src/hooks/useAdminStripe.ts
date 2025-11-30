// src/hooks/useAdminStripe.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

export interface StripeStats {
    balance: {
        available: number;
        pending: number;
        currency: string;
    };
    subscribers: {
        active: number;
        past_due: number; // Important: Failed payments
        canceled: number;
        trialing: number;
    };
}

export interface StripeCustomer {
    id: string;
    email: string | null;
    name: string | null;
    balance: number;
    created: number;
    subscription: {
        status: string;
        interval: string;
        amount: number;
        currency: string;
        current_period_end: number;
    } | null;
    card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    } | null;
}

interface StripeCustomersResponse {
    data: StripeCustomer[];
    has_more: boolean;
    first_id: string | null;
    last_id: string | null;
}

export const useStripeFinancialStats = () => {
    return useQuery<StripeStats>({
        queryKey: ['stripeStats'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/financials/stats');
            return response.data;
        },
        refetchInterval: 60000, // Refresh every minute
    });
};

export const useStripeCustomers = (limit: number, startingAfter?: string, endingBefore?: string) => {
    return useQuery<StripeCustomersResponse>({
        queryKey: ['stripeCustomers', limit, startingAfter, endingBefore],
        queryFn: async () => {
            const params: any = { limit };
            if (startingAfter) params.starting_after = startingAfter;
            if (endingBefore) params.ending_before = endingBefore;

            const response = await apiClient.get('/admin/financials/customers', { params });
            return response.data;
        },
        placeholderData: (prev) => prev,
    });
};