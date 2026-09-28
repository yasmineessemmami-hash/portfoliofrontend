import apiClient from "@/services/api";

export interface EventThemesData {
  normal: boolean;
  christmas: boolean;
  easter: boolean;
  halloween: boolean;
}

export interface EventThemesResponse {
  data: EventThemesData;
}

export const eventThemeService = {
  /**
   * Fetch available event/seasonal themes
   * POST /api/v1/frontend/events/theme
   */
  getEventThemes: async (): Promise<EventThemesData> => {
    const response = await apiClient.post<EventThemesResponse>(
      "/frontend/events/theme"
    );
    return response.data.data;
  },
};

