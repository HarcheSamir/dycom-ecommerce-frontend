// src/hooks/useWinningProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';



export interface WinningProduct {
  id: string;
  productId: bigint;
  title: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  salesVolume: number | null;
  categoryName: string | null;
  firstLevelCategoryName: string | null;
  historicalData: { date: string; sales: number }[] | null;
  googleTrendKeyword: string | null;
  // THIS IS THE FIX
  shopName: string | null;
  shopEvaluationRate: string | null;
   shopUrl: string | null;
  shopId: bigint | null;
}

// For the main list, which includes pagination meta
interface PaginatedProductsResponse {
  data: WinningProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// For the categories list
interface CategoriesResponse {
  data: string[];
}

// For a single product response
interface SingleProductResponse {
    data: WinningProduct;
}

// --- Query Parameters ---
export interface ProductFilters {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'salesVolume' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}


// --- HOOKS ---

/**
 * Fetches a paginated and filterable list of winning products.
 * @param filters - The filter, sort, and pagination parameters.
 */
export const useWinningProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['winningProducts', filters], // The key changes when filters change, triggering a refetch
    queryFn: async () => {
      const { data }: AxiosResponse<PaginatedProductsResponse> = await apiClient.get('/winning-products', {
        params: filters,
      });
      return data;
    },
    placeholderData: (previousData) => previousData, // Keeps old data visible while new data loads
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Fetches a list of unique product categories.
 */
export const useProductCategories = () => {
    return useQuery({
        queryKey: ['productCategories'],
        queryFn: async () => {
            const { data }: AxiosResponse<CategoriesResponse> = await apiClient.get('/winning-products/meta/categories');
            return data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour, as categories don't change often
    });
};

/**
 * Fetches a single winning product by its ID.
 * @param productId - The ID of the product.
 */
export const useSingleProduct = (productId: string | null) => {
    return useQuery({
        queryKey: ['winningProduct', productId],
        queryFn: async () => {
            if (!productId) return null;
            const { data }: AxiosResponse<SingleProductResponse> = await apiClient.get(`/winning-products/${productId}`);
            return data.data;
        },
        enabled: !!productId, // Only run the query if productId is not null
    });
};

/**
 * A mutation to add a product to a user's favorites.
 */
export const useFavoriteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => apiClient.post(`/winning-products/${productId}/favorite`),
        onSuccess: () => {
            console.log('Product favorited!');
        },
        onError: (error) => {
            console.error('Failed to favorite product:', error);
        }
    });
};


export interface TrendDataPoint {
  time: string;
  formattedTime: string;
  value: [number];
}

interface TrendsResponse {
  data: TrendDataPoint[];
}

/**
 * Fetches Google Trends data for a single product.
 * @param productId - The ID of the product.
 */
export const useProductTrends = (productId: string | null) => {
    return useQuery({
        queryKey: ['productTrends', productId],
        queryFn: async () => {
            if (!productId) return null;
            const { data }: AxiosResponse<TrendsResponse> = await apiClient.get(`/winning-products/${productId}/trends`);
            return data.data;
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 60,
    });
};