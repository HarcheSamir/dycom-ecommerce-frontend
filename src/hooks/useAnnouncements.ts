import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

// ============================================================
// TYPES
// ============================================================

export interface Announcement {
    id: string;
    title: string;
    headline: string;
    description: string | null;
    type: 'BANNER' | 'MODAL' | 'CAROUSEL';
    imageUrl: string | null;
    cloudinaryId: string | null;
    videoVimeoId: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    audience: string;
    startsAt: string;
    endsAt: string | null;
    isActive: boolean;
    priority: number;
    isDismissible: boolean;
    colorScheme: string | null;
    customGradient: string | null;
    createdAt: string;
    updatedAt: string;
    creator?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    _count?: {
        dismissals: number;
    };
}

export interface ActiveAnnouncement {
    id: string;
    headline: string;
    description: string | null;
    type: 'BANNER' | 'MODAL' | 'CAROUSEL';
    imageUrl: string | null;
    videoVimeoId: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    isDismissible: boolean;
    colorScheme: string | null;
    customGradient: string | null;
    priority: number;
}

interface AdminAnnouncementsResponse {
    data: Announcement[];
    total: number;
    page: number;
    totalPages: number;
}

// ============================================================
// ADMIN HOOKS
// ============================================================

export const useAdminAnnouncements = (page = 1) => {
    return useQuery<AdminAnnouncementsResponse>({
        queryKey: ['admin-announcements', page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/announcements?page=${page}&limit=20`);
            return data;
        },
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation<Announcement, Error, FormData>({
        mutationFn: async (formData) => {
            const { data } = await apiClient.post('/admin/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
        },
    });
};

export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation<Announcement, Error, { id: string; formData: FormData }>({
        mutationFn: async ({ id, formData }) => {
            const { data } = await apiClient.put(`/admin/announcements/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        },
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            await apiClient.delete(`/admin/announcements/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        },
    });
};

export const useToggleAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation<Announcement, Error, string>({
        mutationFn: async (id) => {
            const { data } = await apiClient.put(`/admin/announcements/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        },
    });
};

// ============================================================
// USER-FACING HOOKS
// ============================================================

export const useActiveAnnouncements = () => {
    return useQuery<ActiveAnnouncement[]>({
        queryKey: ['active-announcements'],
        queryFn: async () => {
            const { data } = await apiClient.get('/announcements/active');
            return data;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useDismissAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            await apiClient.post(`/announcements/${id}/dismiss`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
        },
    });
};
