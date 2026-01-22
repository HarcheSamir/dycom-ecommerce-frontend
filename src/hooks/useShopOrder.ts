// src/hooks/useShopOrder.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

// Types
export interface ShopOrder {
    id: string;
    userId: string;
    status: 'DRAFT' | 'PENDING_PAYMENT' | 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    brandName?: string;
    hasOwnLogo: boolean;
    logoUrl?: string;
    logoStyle?: string;
    productSource?: 'OWN' | 'TRENDING';
    ownProductInfo?: any;
    selectedProductId?: string;
    productCount: number;
    siteLanguages?: string[];
    isMultilingual: boolean;
    selectedStyle?: string;
    colorPalette?: { primary: string; secondary: string; accent: string };
    contactName?: string;
    contactEmail?: string;
    contactWhatsApp?: string;
    timezone?: string;
    wantsAdsVisuals: boolean;
    wantsUGC: boolean;
    wantsCopywriting: boolean;
    wantsPremiumLogo: boolean;
    additionalNotes?: string;
    shopifyStoreUrl?: string;
    shopifyApiToken?: string;
    inspirationUrls?: string[];
    pricingTier?: 'TIER_1' | 'TIER_2' | 'QUOTE';
    totalPrice?: number;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
    adminNotes?: string;
    files: ShopOrderFile[];
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface ShopOrderFile {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    mimeType?: string;
    fileSize?: number;
}

export interface TrendingProduct {
    id: string;
    productId: string;
    title: string;
    imageUrl: string;
    price: number;
    currency: string;
    salesVolume: number;
    categoryName?: string;
    firstLevelCategoryName?: string;
}

export interface WinningProductsResponse {
    data: TrendingProduct[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface WinningProductsFilters {
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'salesVolume' | 'price_asc' | 'price_desc' | 'newest';
    page?: number;
    limit?: number;
}

// ================
// USER HOOKS
// ================

/**
 * Get or create draft order
 */
export const useShopOrderDraft = () => {
    return useQuery({
        queryKey: ['shopOrderDraft'],
        queryFn: async () => {
            const { data } = await apiClient.get<ShopOrder>('/shop-orders/draft');
            return data;
        }
    });
};

/**
 * Save draft order (autosave)
 */
export const useSaveDraft = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderData: Partial<ShopOrder> & { orderId?: string }) => {
            const { data } = await apiClient.post<ShopOrder>('/shop-orders/draft', orderData);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['shopOrderDraft'], data);
        }
    });
};

/**
 * Get winning products with search, filter, and pagination
 */
export const useWinningProducts = (filters: WinningProductsFilters = {}) => {
    const { keyword, category, minPrice, maxPrice, sortBy = 'salesVolume', page = 1, limit = 20 } = filters;

    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (category) queryParams.append('category', category);
    if (minPrice !== undefined) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    return useQuery({
        queryKey: ['winningProducts', { keyword, category, minPrice, maxPrice, sortBy, page, limit }],
        queryFn: async () => {
            const { data } = await apiClient.get<WinningProductsResponse>(
                `/winning-products?${queryParams.toString()}`
            );
            return data;
        }
    });
};

/**
 * Get product categories for filtering
 */
export const useProductCategories = () => {
    return useQuery({
        queryKey: ['productCategories'],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: string[] }>('/winning-products/meta/categories');
            return data.data;
        },
        staleTime: 1000 * 60 * 10,
    });
};

/**
 * Legacy hook for simple trending products
 */
export const useTrendingProducts = (limit: number = 4) => {
    return useQuery({
        queryKey: ['trendingProducts', limit],
        queryFn: async () => {
            const { data } = await apiClient.get<WinningProductsResponse>(
                `/winning-products?limit=${limit}&sortBy=salesVolume`
            );
            return data.data;
        }
    });
};


/**
 * Upload file to order
 */
export const useUploadFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, file, fileType }: { orderId: string; file: File; fileType: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileType', fileType);

            const { data } = await apiClient.post<ShopOrderFile>(
                `/shop-orders/${orderId}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shopOrderDraft'] });
        }
    });
};

/**
 * Delete uploaded file
 */
export const useDeleteFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, fileId }: { orderId: string; fileId: string }) => {
            await apiClient.delete(`/shop-orders/${orderId}/files/${fileId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shopOrderDraft'] });
        }
    });
};

/**
 * Submit order
 */
export const useSubmitOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            const { data } = await apiClient.post<ShopOrder>(
                `/shop-orders/${orderId}/submit`,
                {}
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shopOrderDraft'] });
            queryClient.invalidateQueries({ queryKey: ['myShopOrders'] });
        }
    });
};

/**
 * Get user's orders history
 */
export const useMyShopOrders = () => {
    return useQuery({
        queryKey: ['myShopOrders'],
        queryFn: async () => {
            const { data } = await apiClient.get<ShopOrder[]>('/shop-orders/my-orders');
            return data;
        }
    });
};

// ================
// ADMIN HOOKS
// ================

/**
 * Admin: Get all orders with filters
 */
export const useAdminShopOrders = (filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['adminShopOrders', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());

            const { data } = await apiClient.get(
                `/shop-orders/admin/all?${params.toString()}`
            );
            return data as {
                orders: ShopOrder[];
                pagination: { total: number; page: number; limit: number; totalPages: number };
            };
        }
    });
};

/**
 * Admin: Get stats
 */
export const useAdminShopOrderStats = () => {
    return useQuery({
        queryKey: ['adminShopOrderStats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/shop-orders/admin/stats');
            return data as {
                totalOrders: number;
                pendingPayment: number;
                submitted: number;
                inProgress: number;
                completed: number;
            };
        }
    });
};

/**
 * Admin: Get order details
 */
export const useAdminShopOrderDetails = (orderId: string) => {
    return useQuery({
        queryKey: ['adminShopOrderDetails', orderId],
        queryFn: async () => {
            const { data } = await apiClient.get<ShopOrder>(`/shop-orders/admin/${orderId}`);
            return data;
        },
        enabled: !!orderId
    });
};

/**
 * Admin: Update order status
 */
export const useAdminUpdateStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const { data } = await apiClient.put(
                `/shop-orders/admin/${orderId}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminShopOrders'] });
            queryClient.invalidateQueries({ queryKey: ['adminShopOrderStats'] });
        }
    });
};

/**
 * Admin: Update notes
 */
export const useAdminUpdateNotes = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
            const { data } = await apiClient.put(
                `/shop-orders/admin/${orderId}/notes`,
                { notes }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminShopOrders'] });
        }
    });
};

// ================
// PRICING HELPERS
// ================

export const PRICING_TIERS = {
    TIER_1: { min: 1, max: 3, price: 299, label: '1-3 produits' },
    TIER_2: { min: 4, max: 10, price: 599, label: '4-10 produits' },
    QUOTE: { min: 11, max: Infinity, price: null, label: '10+ produits (sur devis)' }
};

export const getPricingTier = (productCount: number) => {
    if (productCount >= 1 && productCount <= 3) return PRICING_TIERS.TIER_1;
    if (productCount >= 4 && productCount <= 10) return PRICING_TIERS.TIER_2;
    return PRICING_TIERS.QUOTE;
};

export const formatPrice = (price: number | null) => {
    if (price === null) return 'Sur devis';
    return `${price}€`;
};
