// src/hooks/useNotifications.ts

import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';

// Define the shape of a single notification from the backend
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string; // The date is a string in ISO format
  userId: string;
}

/**
 * Hook to fetch the most recent notifications for the logged-in user.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response: AxiosResponse<Notification[]> = await apiClient.get('/profile/notifications');
      return response.data;
    },
    staleTime: 1000 * 60, // Cache for 1 minute to keep it fresh
  });
};