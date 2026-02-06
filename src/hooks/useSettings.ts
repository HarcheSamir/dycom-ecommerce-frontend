import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import toast from 'react-hot-toast';

export const usePublicSettings = () => {
    return useQuery({
        queryKey: ['publicSettings'],
        queryFn: async () => {
            const { data } = await apiClient.get<{ urgencyEnabled: boolean }>('/settings/public');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { urgencyEnabled: boolean }) => {
            return apiClient.patch('/settings', data);
        },
        onSuccess: () => {
            // Invalidate both public settings (for UI) and admin settings (if you add a fetch hook later)
            queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
            toast.success('Settings updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update settings.');
        }
    });
};
