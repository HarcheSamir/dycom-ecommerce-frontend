// src/hooks/useContentCreator.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { type AxiosResponse, AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Region } from './useRegions';
import { getCountryInfo } from '../lib/countryUtils';

interface Niche { id: string; name: string; }
interface Meta { total: number; page: number; limit: number; totalPages: number; }
export interface SearchParams { keyword?: string; country?: string; platform?: string; minFollowers?: number; maxFollowers?: number; page?: number; limit?: number; }

export interface Creator {
  id: string;
  username: string | null;
  nickname: string | null;
  profileLink: string | null;
  country: string | null;
  region: Region;
  followers: number | null;
  posts: number | null;
  likes: number | null;
  instagram: string | null;
  youtube: string | null;
  bio: string | null;
  email: string | null;
  niche: Niche | null;
}

interface SearchResponse {
  data: Creator[];
  meta: Meta;
}

export const useSearchCreators = (filters: SearchParams) => {
  return useQuery({
    queryKey: ['creators', filters],
    queryFn: async () => {
      const response: AxiosResponse<SearchResponse> = await apiClient.post('/content-creators/search', filters);
      return response.data;
    },
    select: (data) => {
      const enrichedCreators = data.data.map(creator => {
        if (creator.region) {
          const countryInfo = getCountryInfo(creator.region.name);
          return {
            ...creator,
            region: {
              ...creator.region,
              countryName: countryInfo ? countryInfo.name : creator.region.name,
              flag: countryInfo ? countryInfo.flag : null,
            }
          };
        }
        return creator;
      });
      return { ...data, data: enrichedCreators };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
  });
};

export const useCreator = (creatorId: string | undefined) => {
  return useQuery({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      if (!creatorId) return null;
      const response: AxiosResponse<Creator> = await apiClient.get(`/content-creators/${creatorId}`);
      return response.data;
    },
    select: (creator) => {
      if (!creator) return null;
      if (creator.region) {
        const countryInfo = getCountryInfo(creator.region.name);
        return {
          ...creator,
          region: {
            ...creator.region,
            countryName: countryInfo ? countryInfo.name : creator.region.name,
            flag: countryInfo ? countryInfo.flag : null,
          }
        };
      }
      return creator;
    },
    enabled: !!creatorId,
  });
};

export const useRecordVisit = () => {
  return useMutation({
    mutationFn: (creatorId: string) =>
      apiClient.get(`/content-creators/${creatorId}/visit`),
  });
};