import apiClient from "@/services/api";

export const aboutService = {
  getAboutData: async (): Promise<any> => {
    const response = await apiClient.post("/about");
    return response.data.data;
  },

  getAboutMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/about", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateAboutHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/hero/update", data);
    return response.data.data;
  },

  updateAboutStats: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/stats/update", data);
    return response.data.data;
  },

  updateAboutIntroduction: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/introduction/update", data);
    return response.data.data;
  },

  updateAboutServices: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/services/update", data);
    return response.data.data;
  },

  updateAboutWorkProcess: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/work-process/update", data);
    return response.data.data;
  },

  updateAboutValues: async (data: any): Promise<any> => {
    const response = await apiClient.post("/about/values/update", data);
    return response.data.data;
  },

  updateAboutMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/about/update", data);
    return response.data.data;
  },
};
