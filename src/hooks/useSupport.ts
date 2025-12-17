import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

// --- Types ---
export interface TicketMessage {
    id: string;
    content: string;
    senderType: 'USER' | 'ADMIN' | 'GUEST' | 'SYSTEM';
    isInternal: boolean;
    createdAt: string;
}

export interface Ticket {
    id: string;
    userId?: string | null; 
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category: string;
    createdAt: string;
    messages?: TicketMessage[];
    user?: {
        id?: string;
        email: string;
        firstName: string;
        lastName: string;
        subscriptionStatus: string;
    };
    guestEmail?: string;
    guestName?: string;
}

// --- USER HOOKS ---

export const useUserTickets = () => {
    return useQuery<Ticket[]>({
        queryKey: ['myTickets'],
        queryFn: async () => (await apiClient.get('/support/my-tickets')).data
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { subject: string; category: string; message: string }) =>
            apiClient.post('/support/create', data),
        onSuccess: () => {
            toast.success("Ticket created successfully!");
            queryClient.invalidateQueries({ queryKey: ['myTickets'] });
        },
        onError: () => toast.error("Failed to create ticket.")
    });
};

// --- ADMIN HOOKS ---

export const useAdminTickets = (status: string) => {
    return useQuery<{ data: Ticket[], meta: any }>({
        queryKey: ['adminTickets', status],
        queryFn: async () => (await apiClient.get('/support/admin/all', { params: { status } })).data
    });
};

export const useTicketDetails = (ticketId: string | null) => {
    return useQuery<Ticket>({
        queryKey: ['ticket', ticketId],
        queryFn: async () => (await apiClient.get(`/support/admin/${ticketId}`)).data,
        enabled: !!ticketId,
        refetchInterval: 10000 // Poll every 10s for new messages
    });
};

export const useAdminReply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { ticketId: string; message: string; isInternal: boolean; newStatus?: string }) =>
            apiClient.post(`/support/admin/${data.ticketId}/reply`, data),
        onSuccess: (_, variables) => {
            toast.success("Reply sent.");
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
        }
    });
};

// --- GUEST HOOKS ---

export const useGuestTicket = (ticketId: string, accessKey: string) => {
    return useQuery<Ticket>({
        queryKey: ['guestTicket', ticketId],
        queryFn: async () => (await apiClient.get(`/support/public/${ticketId}?key=${accessKey}`)).data,
        enabled: !!ticketId && !!accessKey,
        retry: false
    });
};

export const useGuestReply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { ticketId: string; key: string; message: string }) =>
            apiClient.post(`/support/public/${data.ticketId}/reply`, data),
        onSuccess: (_, variables) => {
            toast.success("Message sent!");
            queryClient.invalidateQueries({ queryKey: ['guestTicket', variables.ticketId] });
        }
    });
};