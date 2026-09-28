import apiClient from "@/services/api";

export interface SocialPlatform {
  key: string;
  icon: string;
  name: string;
  library: string;
}

export interface SocialPlatformsResponse {
  success: boolean;
  message: string;
  data: SocialPlatform[];
}

export const socialService = {
  /**
   * Fetch available social platforms
   * POST /api/v1/ui/social-icons
   */
  getSocialPlatforms: async (): Promise<SocialPlatform[]> => {
    const response = await apiClient.post<SocialPlatformsResponse>(
      "/ui/social-icons"
    );
    return response.data.data;
  },
};
