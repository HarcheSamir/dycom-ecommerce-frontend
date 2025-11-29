// src/hooks/useRegions.ts

import { useQuery } from '@tanstack/react-query';
import { type AxiosError, type AxiosResponse } from 'axios';
import apiClient from '../lib/apiClient';
import { getCountryInfo } from '../lib/countryUtils';

export type Region = {
  id: string;
  name: string; // This is the country code, e.g., "US"
  countryName: string | null;
  flag: string | null;
};

interface RegionsResponse {
  data: Region[];
}

export const useRegions = () => {
  return useQuery<Region[], AxiosError>({
    queryKey: ['regions'],
    queryFn: async () => {
      const response: AxiosResponse<RegionsResponse> = await apiClient.get('/content-creators/regions');
      return response.data.data;
    },
    select: (data) => {
      const enrichedData = data.map(region => {
        const countryInfo = getCountryInfo(region.name);
        return {
          ...region,
          countryName: countryInfo ? countryInfo.name : region.name,
          flag: countryInfo ? countryInfo.flag : null,
        };
      });
      enrichedData.sort((a, b) => (a.countryName || a.name).localeCompare(b.countryName || b.name));
      return enrichedData;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};