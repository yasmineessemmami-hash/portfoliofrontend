import apiClient from "@/services/api";

export const projectsService = {
  getProjects: async (): Promise<any> => {
    const response = await apiClient.post("/projects");
    return response.data.data;
  },

  getProjectsMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/projects", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateProjectsHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/projects/hero/update", data);
    return response.data.data;
  },

  updateProjectItem: async (data: any): Promise<any> => {
    const response = await apiClient.post("/projects/items/update", data);
    return response.data.data;
  },

  deleteProjectItem: async (id: number): Promise<any> => {
    const response = await apiClient.post("/projects/items/delete", { id });
    return response.data.data;
  },

  updateProjectsMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/projects/update", data);
    return response.data.data;
  },
};
