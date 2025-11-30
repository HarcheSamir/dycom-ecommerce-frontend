import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

// --- Type Definitions ---
export interface AdminStats {
    activeSubscribers: number;
    totalUsers: number;
    monthlyRevenue: number;
    totalVideos: number;
    totalCourses: number;
    totalInfluencers: number;
    totalProducts: number;
    monthlyRevenueChart: { [key: string]: number };
}
export interface AdminCourse {
    id: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    totalVideos: number;
    priceEur: number | null;
    priceUsd: number | null;
    priceAed: number | null;
    language: 'FR' | 'EN' | 'AR';
}
interface NewCourseData {
    title: string;
    description?: string;
    coverImageUrl: string;
    priceEur?: number;
    priceUsd?: number;
    priceAed?: number;
    language?: string;
}
export interface AdminVideo { id: string; title: string; vimeoId: string; description: string | null; duration: number | null; order: number; }
export interface AdminSection { id: string; title: string; videos: AdminVideo[]; }
export interface AdminCourseDetails extends AdminCourse { sections: AdminSection[]; }
export interface AdminSettings { [key: string]: string; }
export interface AffiliateLeaderboardEntry {
    id: string;
    name: string;
    email: string;
    totalReferrals: number;
    payingReferrals: number;
}
interface UpdateSectionOrderData {
    courseId: string;
    sections: { id: string; order: number }[];
}

// --- THIS IS THE SINGLE, CORRECT DEFINITION ---
interface UpdateCourseData {
    courseId: string;
    data: {
        title?: string;
        description?: string;
        coverImageUrl?: string;
        priceEur?: number | null;
        priceUsd?: number | null;
        priceAed?: number | null;
        language?: string;
    }
}
export interface AdminUserDetail {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: string;
        subscriptionStatus: string;
        installmentsPaid: number;
        installmentsRequired: number;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        transactions: any[];
        coursePurchases: any[];
        videoProgress: any[];
    };
    stripeData: any;
}

// --- HOOKS ---
export const useAdminDashboardStats = () => useQuery({ queryKey: ['adminDashboardStats'], queryFn: async (): Promise<AdminStats> => { const response: AxiosResponse<AdminStats> = await apiClient.get('/admin/stats'); return response.data; }, staleTime: 1000 * 60 * 5 });
export const useAdminCourses = () => useQuery({ queryKey: ['adminCourses'], queryFn: async (): Promise<AdminCourse[]> => { const response: AxiosResponse<AdminCourse[]> = await apiClient.get('/admin/courses'); return response.data; } });
export const useCreateCourse = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: (newCourse: NewCourseData) => apiClient.post('/admin/courses', newCourse), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCourses'] }); queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] }); } }); };
export const useAdminCourseDetails = (courseId: string | null) => useQuery({ queryKey: ['adminCourseDetails', courseId], queryFn: async (): Promise<AdminCourseDetails> => { if (!courseId) throw new Error("No course ID provided"); const response: AxiosResponse<AdminCourseDetails> = await apiClient.get(`/admin/courses/${courseId}`); return response.data; }, enabled: !!courseId });
interface NewSectionData { title: string; courseId: string; }
export const useCreateSection = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ title, courseId }: NewSectionData) => apiClient.post(`/admin/courses/${courseId}/sections`, { title }), onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };
interface NewVideoData { title: string; vimeoId: string; description?: string; duration?: number; order?: number; sectionId: string; courseId: string; }
export const useAddVideoToSection = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: (videoData: NewVideoData) => apiClient.post(`/admin/sections/${videoData.sectionId}/videos`, videoData), onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };
export const useDeleteCourse = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: (courseId: string) => apiClient.delete(`/admin/courses/${courseId}`), onSuccess: () => { toast.success("Formation supprimée !"); queryClient.invalidateQueries({ queryKey: ['adminCourses'] }); } }); };

// --- FIX: DEFINITION FOR UpdateSectionData WAS MISSING ---
interface UpdateSectionData { sectionId: string; courseId: string; data: { title: string } }
export const useUpdateSection = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ sectionId, data }: UpdateSectionData) => apiClient.put(`/admin/sections/${sectionId}`, data), onSuccess: (_, variables) => { toast.success("Section mise à jour !"); queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };

interface DeleteSectionData { sectionId: string; courseId: string; }
export const useDeleteSection = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ sectionId }: DeleteSectionData) => apiClient.delete(`/admin/sections/${sectionId}`), onSuccess: (_, variables) => { toast.success("Section supprimée !"); queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };
interface UpdateVideoData { videoId: string; courseId: string; data: { title: string; vimeoId: string; description?: string; duration?: number } }
export const useUpdateVideo = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ videoId, data }: UpdateVideoData) => apiClient.put(`/admin/videos/${videoId}`, data), onSuccess: (_, variables) => { toast.success("Vidéo mise à jour !"); queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };
interface DeleteVideoData { videoId: string; courseId: string; }
export const useDeleteVideo = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ videoId }: DeleteVideoData) => apiClient.delete(`/admin/videos/${videoId}`), onSuccess: (_, variables) => { toast.success("Vidéo supprimée !"); queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] }); } }); };
export interface PricingGrid {
    '1': { eur: number; usd: number; aed: number };
    '2': { eur: number; usd: number; aed: number };
    '3': { eur: number; usd: number; aed: number };
}

interface UpdateVideoOrderData {
    sectionId: string;
    courseId: string;
    videos: { id: string; order: number }[];
}
export const useUpdateVideoOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sectionId, videos }: UpdateVideoOrderData) => apiClient.put(`/admin/sections/${sectionId}/videos/order`, { videos }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] });
        }
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, data }: UpdateCourseData) => apiClient.put(`/admin/courses/${courseId}`, data),
        onSuccess: (_, variables) => {
            toast.success("Formation mise à jour !");
            queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour.");
        }
    });
};

export const useGetSettings = () => useQuery({ queryKey: ['adminSettings'], queryFn: async (): Promise<AdminSettings> => { const response: AxiosResponse<AdminSettings> = await apiClient.get('/admin/settings'); return response.data; } });
export const useUpdateSettings = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: (settings: AdminSettings) => apiClient.put('/admin/settings', settings), onSuccess: () => { toast.success("Réglages mis à jour !"); queryClient.invalidateQueries({ queryKey: ['adminSettings'] }); }, onError: () => { toast.error("Erreur lors de la mise à jour des réglages."); } }); };

export const useAffiliateLeaderboard = () => {
    return useQuery<AffiliateLeaderboardEntry[], Error>({
        queryKey: ['adminAffiliateLeaderboard'],
        queryFn: async () => {
            const response: AxiosResponse<AffiliateLeaderboardEntry[]> = await apiClient.get('/admin/affiliates/leaderboard');
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};


export const useGetMembershipPrices = () => {
    return useQuery<PricingGrid, Error>({
        queryKey: ['membershipPrices'],
        queryFn: async () => {
            const response: AxiosResponse<PricingGrid> = await apiClient.get('/admin/membership-prices');
            return response.data;
        },
        staleTime: 0, // Always fetch fresh to avoid sync issues with Stripe
    });
};

export const useUpdateMembershipPrices = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pricingGrid: PricingGrid) => apiClient.put('/admin/membership-prices', { pricingGrid }),
        onSuccess: () => {
            toast.success("Membership prices updated in Stripe!");
            queryClient.invalidateQueries({ queryKey: ['membershipPrices'] });
        },
        onError: () => {
            toast.error("Failed to update prices.");
        }
    });
};

export const useUpdateSectionOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, sections }: UpdateSectionOrderData) => 
            apiClient.put(`/admin/courses/${courseId}/sections/order`, { sections }),
        onSuccess: (_, variables) => {
            // Silently update the cache or show a small toast if you prefer
            queryClient.invalidateQueries({ queryKey: ['adminCourseDetails', variables.courseId] });
        }
    });
};


export const useAdminUserDetails = (userId: string | undefined) => {
    return useQuery<AdminUserDetail, Error>({
        queryKey: ['adminUser', userId],
        queryFn: async () => {
            if (!userId) throw new Error("No User ID");
            const response = await apiClient.get(`/admin/users/${userId}`);
            return response.data;
        },
        enabled: !!userId
    });
};

export const useGrantLifetime = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => apiClient.post(`/admin/users/${userId}/grant-lifetime`),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
            toast.success("Lifetime access granted!");
        },
        onError: () => toast.error("Failed to grant access.")
    });
};