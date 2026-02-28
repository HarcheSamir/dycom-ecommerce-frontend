import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

interface SendNewsletterPayload {
    subject: string;
    htmlContent: string;
    audience: string;
    specificEmails?: string[];
}

interface SendNewsletterResponse {
    success: boolean;
    newsletterId: string;
    totalRecipients: number;
    totalSent: number;
    errors?: string[];
}

interface Newsletter {
    id: string;
    subject: string;
    htmlContent: string;
    audience: string;
    recipientCount: number;
    sentAt: string;
    sender: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface NewsletterHistoryResponse {
    data: Newsletter[];
    total: number;
    page: number;
    totalPages: number;
}

export const useSendNewsletter = () => {
    const queryClient = useQueryClient();

    return useMutation<SendNewsletterResponse, Error, SendNewsletterPayload>({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post('/admin/newsletter/send', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletter-history'] });
        },
    });
};

export const useNewsletterHistory = (page = 1) => {
    return useQuery<NewsletterHistoryResponse>({
        queryKey: ['newsletter-history', page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/newsletter/history?page=${page}&limit=10`);
            return data;
        },
    });
};

export const useRecipientCount = (audience: string) => {
    return useQuery<{ count: number }>({
        queryKey: ['recipient-count', audience],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/newsletter/recipient-count?audience=${audience}`);
            return data;
        },
    });
};
