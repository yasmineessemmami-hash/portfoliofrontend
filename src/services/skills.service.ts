import apiClient from "@/services/api";

export const skillsService = {
  getSkillsData: async (): Promise<any> => {
    const response = await apiClient.post("/skills");
    return response.data.data;
  },

  getSkillsMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/skills", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateSkillsHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/skills/hero/update", data);
    return response.data.data;
  },

  updateSkillsSocialLinks: async (data: any): Promise<any> => {
    const response = await apiClient.post("/skills/social-links/update", data);
    return response.data.data;
  },

  updateSkillsCategories: async (data: any): Promise<any> => {
    const response = await apiClient.post("/skills/categories/update", data);
    return response.data.data;
  },

  updateLearningFocus: async (data: any): Promise<any> => {
    const response = await apiClient.post("/skills/learning-focus/update", data);
    return response.data.data;
  },

  updateSkillsMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/skills/update", data);
    return response.data.data;
  },
};
