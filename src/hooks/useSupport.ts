import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

// --- Types ---
export interface TicketAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
    createdAt: string;
}

export interface TicketMessage {
    id: string;
    content: string;
    senderType: 'USER' | 'ADMIN' | 'GUEST' | 'SYSTEM';
    isInternal: boolean;
    createdAt: string;
    attachments?: TicketAttachment[];
    // Edit & Delete tracking
    isDeleted?: boolean;
    deletedAt?: string;
    editedAt?: string;
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
    accessToken?: string;
    adminUnread?: boolean;
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
        mutationFn: (data: { subject: string; category: string; message: string; files?: File[] }) => {
            const formData = new FormData();
            formData.append('subject', data.subject);
            formData.append('category', data.category);
            formData.append('message', data.message);

            if (data.files) {
                data.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            return apiClient.post('/support/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
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
        queryFn: async () => (await apiClient.get('/support/admin/all', { params: { status } })).data,
        refetchInterval: 15000 // Poll every 15 seconds for new tickets
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
        mutationFn: (data: { ticketId: string; message: string; isInternal: boolean; newStatus?: string; files?: File[] }) => {
            const formData = new FormData();
            formData.append('message', data.message);
            formData.append('isInternal', String(data.isInternal));
            if (data.newStatus) {
                formData.append('newStatus', data.newStatus);
            }

            if (data.files && !data.isInternal) {
                data.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            return apiClient.post(`/support/admin/${data.ticketId}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (_, variables) => {
            toast.success("Reply sent.");
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
        }
    });
};

export const useEditMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { messageId: string; content: string; ticketId: string }) =>
            apiClient.patch(`/support/admin/message/${data.messageId}`, { content: data.content }),
        onSuccess: (_, variables) => {
            toast.success("Message updated.");
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
        },
        onError: () => toast.error("Failed to update message.")
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { messageId: string; ticketId: string }) =>
            apiClient.delete(`/support/admin/message/${data.messageId}`),
        onSuccess: (_, variables) => {
            toast.success("Message deleted.");
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
        },
        onError: () => toast.error("Failed to delete message.")
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
        mutationFn: (data: { ticketId: string; key: string; message: string; files?: File[] }) => {
            const formData = new FormData();
            formData.append('key', data.key);
            formData.append('message', data.message);

            if (data.files) {
                data.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            return apiClient.post(`/support/public/${data.ticketId}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (_, variables) => {
            toast.success("Message sent!");
            queryClient.invalidateQueries({ queryKey: ['guestTicket', variables.ticketId] });
        }
    });
};