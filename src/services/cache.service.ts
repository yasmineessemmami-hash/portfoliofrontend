import apiClient from "@/services/api";

export const cacheService = {
  /**
   * Clear all caches
   * POST /api/v1/cache/clear
   */
  clearCache: async (): Promise<any> => {
    const response = await apiClient.post("/cache/clear");
    return response.data;
  },

  /**
   * Refresh all caches (queued)
   * POST /api/v1/cache/refresh
   */
  refreshCache: async (): Promise<any> => {
    const response = await apiClient.post("/cache/refresh");
    return response.data;
  },
};

