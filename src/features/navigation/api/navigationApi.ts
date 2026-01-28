/**
 * Navigation RTK Query API
 * Placeholder API for navigation-related endpoints
 * Origin: AppHomeController.js route-related API calls
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

export const navigationApi = createApi({
  reducerPath: 'navigationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['Navigation'],
  endpoints: () => ({
    // Navigation doesn't have specific API endpoints
    // This is a placeholder for future route-related APIs
  }),
});
