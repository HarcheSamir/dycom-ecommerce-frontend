// src/hooks/useDashboardStats.ts

import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';

// Define the shape of the API response
interface DashboardStats {
  totalCourses: number;
  countriesCovered: number;
  totalWinningProducts: number;
  totalInfluencers: number; // <-- Add the new property
}

/**
 * Hook to fetch aggregated statistics for the main dashboard.
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response: AxiosResponse<DashboardStats> = await apiClient.get('/dashboard/stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};