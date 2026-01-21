// src/hooks/useResources.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

// Types
export interface ResourceCategory {
    id: string;
    name: string;
    description?: string;
    order: number;
    icon?: string;
    createdAt: string;
    updatedAt: string;
    resources?: Resource[];
    _count?: { resources: number };
}

export interface Resource {
    id: string;
    title: string;
    description?: string;
    type: 'FILE' | 'URL';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    externalUrl?: string;
    categoryId: string;
    category?: ResourceCategory;
    order: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// USER HOOKS
// ============================================

export const useResources = () => {
    return useQuery<ResourceCategory[]>({
        queryKey: ['resources'],
        queryFn: async () => {
            const { data } = await apiClient.get('/resources');
            return data;
        },
    });
};

export const useResourceCategories = () => {
    return useQuery<ResourceCategory[]>({
        queryKey: ['resource-categories'],
        queryFn: async () => {
            const { data } = await apiClient.get('/resources/categories');
            return data;
        },
    });
};

// ============================================
// ADMIN HOOKS
// ============================================

export const useAdminCategories = () => {
    return useQuery<ResourceCategory[]>({
        queryKey: ['admin-resource-categories'],
        queryFn: async () => {
            const { data } = await apiClient.get('/resources/admin/categories');
            return data;
        },
    });
};

export const useAdminResources = () => {
    return useQuery<Resource[]>({
        queryKey: ['admin-resources'],
        queryFn: async () => {
            const { data } = await apiClient.get('/resources/admin/all');
            return data;
        },
    });
};

// Category mutations
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; description?: string; icon?: string }) => {
            const response = await apiClient.post('/resources/admin/categories', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resource-categories'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; icon?: string; order?: number }) => {
            const response = await apiClient.put(`/resources/admin/categories/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resource-categories'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/resources/admin/categories/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resource-categories'] });
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

// Resource mutations
export const useUploadResource = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await apiClient.post('/resources/admin/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

export const useCreateUrlResource = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title: string; description?: string; categoryId: string; externalUrl: string; isPublished?: boolean }) => {
            const response = await apiClient.post('/resources/admin/url', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

export const useUpdateResource = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; categoryId?: string; isPublished?: boolean; order?: number }) => {
            const response = await apiClient.put(`/resources/admin/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

export const useDeleteResource = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/resources/admin/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

// Helper functions
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (mimeType?: string): string => {
    if (!mimeType) return 'FaFile';
    if (mimeType.includes('pdf')) return 'FaFilePdf';
    if (mimeType.includes('csv') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'FaFileExcel';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'FaFileWord';
    if (mimeType.includes('json')) return 'FaFileCode';
    if (mimeType.includes('image')) return 'FaFileImage';
    if (mimeType.includes('zip')) return 'FaFileArchive';
    return 'FaFile';
};
