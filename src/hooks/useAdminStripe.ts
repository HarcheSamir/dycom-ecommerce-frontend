// src/hooks/useAdminStripe.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface StripeTransaction {
    id: string; // Charge ID (ch_...)
    paymentId?: string; // PaymentIntent ID (pi_...)
    amount: number; // In cents usually, backend sends units? let's check backend. Backend sends units.
    currency: string;
    status: string;
    created: number; // Timestamp
    customer: {
        id: string;
        email: string | null;
        name: string | null;
    } | null;
    closer: string; // The editable field
}

export interface CloserStat {
    name: string;
    count: number;
    total: number;
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
        placeholderData: (prev:any) => prev,
    });
};


export const useStripeTransactions = (
    limit: number, 
    startingAfter?: string, 
    endingBefore?: string, 
    search?: string,
    closer?: string // <--- Add this
) => {
    return useQuery<any>({ // Changed type to any temporarily to handle mixed response shapes (Stripe cursor vs Local page)
        queryKey: ['stripeTransactions', limit, startingAfter, endingBefore, search, closer],
        queryFn: async () => {
            const params: any = { limit };
            if (startingAfter) params.starting_after = startingAfter;
            if (endingBefore) params.ending_before = endingBefore;
            if (search) params.search = search;
            if (closer) params.closer = closer; // <--- Pass it

            const response = await apiClient.get('/admin/financials/transactions', { params });
            return response.data;
        },
        placeholderData: (prev:any) => prev,
    });
};

export const useCloserStats = () => {
    return useQuery<CloserStat[]>({
        queryKey: ['closerStats'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/financials/closers');
            return response.data;
        }
    });
};

// --- NEW HOOK: ASSIGN CLOSER ---
export const useAssignCloser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: { 
            paymentId?: string; 
            chargeId: string; 
            amount: number; 
            currency: string; 
            created: number;
            customerId?: string;
            customerEmail?: string;
            closerName: string;
        }) => {
            return apiClient.post('/admin/financials/assign-closer', data);
        },
        onSuccess: async () => {
            // AGGRESSIVE REFRESH:
            // 1. Invalidate Transactions so the input field updates if needed
            await queryClient.invalidateQueries({ 
                queryKey: ['stripeTransactions'],
                refetchType: 'active'
            });

            // 2. Invalidate Stats Menu so the count updates immediately
            await queryClient.invalidateQueries({ 
                queryKey: ['closerStats'],
                refetchType: 'active'
            });
            
            // Force immediate refetch
            await queryClient.refetchQueries({ 
                queryKey: ['closerStats']
            });
        }
    });
};