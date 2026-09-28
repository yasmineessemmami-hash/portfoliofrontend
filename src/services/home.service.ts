import apiClient from "@/services/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface HomeHeroData {
  id?: number;
  status_text: string;
  status_active: boolean;
  full_name: string;
  role_title: string;
  headline: string;
  subheadline: string;
}

export interface HomeFeaturedProjectData {
  id?: number;
  title: string;
  description: string;
  image: string | null; // null when image_type is "icon"
  image_type: "emoji" | "url" | "icon";
  icon_key?: string | null;
  tech: string;
  sort_order: number;
}

export interface MetaPageData {
  title: string;
  description: string;
  locale: "en" | "ar";
  keywords: string[];
}

export const homeService = {
  /**
   * Fetch home page data
   * POST /api/v1/home/meta
   */
  getHomeData: async (): Promise<{ home_hero: HomeHeroData | null; home_featured_projects: HomeFeaturedProjectData[] } | null> => {
    try {
      const response = await apiClient.post<ApiResponse<{ home_hero: HomeHeroData | null; home_featured_projects: HomeFeaturedProjectData[] } | null>>("/home/meta");
      return response.data.data;
    } catch (error) {
      // Return null if data doesn't exist (empty database)
      return null;
    }
  },

  /**
   * Fetch home page SEO metadata
   * POST /api/v1/meta/pages/{page}
   */
  getHomeMeta: async (locale: "en" | "ar" = "en"): Promise<MetaPageData | null> => {
    try {
      const response = await apiClient.post<ApiResponse<MetaPageData>>("/meta/pages/home", { locale });
      return response.data.data;
    } catch (error) {
      // Silently fail - SEO metadata is optional
      console.warn("Failed to fetch SEO metadata:", error);
      return null;
    }
  },

  /**
   * Update home hero
   * POST /api/v1/home/hero/update
   */
  updateHomeHero: async (data: Omit<HomeHeroData, "id">): Promise<HomeHeroData> => {
    const response = await apiClient.post<ApiResponse<HomeHeroData>>("/home/hero/update", data);
    return response.data.data;
  },

  /**
   * Update or create featured project
   * POST /api/v1/home/featured-projects/update
   */
  updateFeaturedProject: async (data: HomeFeaturedProjectData): Promise<HomeFeaturedProjectData> => {
    const response = await apiClient.post<ApiResponse<HomeFeaturedProjectData>>("/home/featured-projects/update", data);
    return response.data.data;
  },

  /**
   * Delete featured project
   * POST /api/v1/home/featured-projects/delete
   */
  deleteFeaturedProject: async (id: number): Promise<void> => {
    await apiClient.post("/home/featured-projects/delete", { id });
  },

  /**
   * Update meta page
   * POST /api/v1/meta/pages/{page}/update
   */
  updateMetaPage: async (page: string, data: MetaPageData): Promise<MetaPageData> => {
    const response = await apiClient.post<ApiResponse<MetaPageData>>(`/meta/pages/${page}/update`, data);
    return response.data.data;
  },
};
