import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';

// --- Type Definitions ---
export interface VideoProgress {
  id: string;
  completed: boolean;
  completedAt: string | null;
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

export interface Section {
  id: string;
  title: string;
  order: number;
  videos: Video[];
}

export interface VideoCourse {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  order: number;
  sections: Section[];
  totalVideos?: number;
  completedVideos?: number;
  price?: number | null;
  currency?: string;
  level?: string;
  rating?: number;
  duration?: string;
  author?: string;
  language?: 'FR' | 'EN' | 'AR';
}

// --- Filter Type Definition ---
export interface CourseFilters {
  lang: string;
  search?: string;
  sortBy?: string;
  language?: string;
}

// --- Hook to fetch all courses (list view) ---
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
  });
};

// --- Hook to fetch a single course with details ---
export const useCourse = (courseId: string | null) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async (): Promise<VideoCourse> => {
      if (!courseId) throw new Error('Course ID is required');
      const response: AxiosResponse<VideoCourse> = await apiClient.get(`/training/courses/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
};

// --- Mutation to update video progress ---
export const useUpdateVideoProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, completed }: { videoId: string, completed: boolean }) =>
      apiClient.post(`/training/videos/${videoId}/progress`, { completed }),

    onSuccess: (_, variables) => {
      // Invalidate both queries to ensure all parts of the UI are updated.
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};