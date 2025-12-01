import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';

export interface VideoProgress {
    id?: string;
    completed: boolean;
    completedAt: string | null;
    lastPosition: number;
    percentage: number;
}

export interface Video {
    id: string;
    title: string;
    description: string | null;
    vimeoId: string;
    duration: number | null;
    order: number;
    progress: VideoProgress[];
}

export interface Section { id: string; title: string; order: number; videos: Video[]; }
export interface VideoCourse { id: string; title: string; description: string | null; coverImageUrl: string | null; order: number; sections: Section[]; totalVideos?: number; completedVideos?: number; price?: number | null; currency?: string; level?: string; rating?: number; duration?: string; author?: string; language?: 'FR' | 'EN' | 'AR'; }
export interface CourseFilters { lang: string; search?: string; sortBy?: string; language?: string; }

export const useCourses = (filters: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async (): Promise<VideoCourse[]> => {
      const { lang, ...apiFilters } = filters;
      const response: AxiosResponse<VideoCourse[]> = await apiClient.get('/training/courses', {
        headers: { 'Accept-Language': lang },
        params: apiFilters,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};

export const useCourse = (courseId: string | null) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async (): Promise<VideoCourse> => {
      if (!courseId) throw new Error('Course ID is required');
      const response: AxiosResponse<VideoCourse> = await apiClient.get(`/training/courses/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateVideoProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { videoId: string, lastPosition: number, percentage: number, completed?: boolean }) => {
      // The only log left, as requested.
      console.log(`%c[API] SAVING: ${data.percentage}%`, 'color: blue; font-weight: bold;');
      return apiClient.post(`/training/videos/${data.videoId}/progress`, data);
    },
    onSuccess: (data, variables) => {
        // Only refresh UI if completed (to show checkmark)
        if (variables.completed || variables.percentage >= 100) {
             queryClient.invalidateQueries({ queryKey: ['course'] });
        }
    },
  });
};