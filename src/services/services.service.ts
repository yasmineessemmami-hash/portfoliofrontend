import apiClient from "@/services/api";

export const servicesService = {
  getServicesData: async (): Promise<any> => {
    const response = await apiClient.post("/services");
    return response.data.data;
  },

  getServicesMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/services", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateServicesHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/services/hero/update", data);
    return response.data.data;
  },

  updateServicesItems: async (data: any): Promise<any> => {
    const response = await apiClient.post("/services/items/update", data);
    return response.data.data;
  },

  updateWhyChooseMe: async (data: any): Promise<any> => {
    const response = await apiClient.post("/services/why-choose-me/update", data);
    return response.data.data;
  },

  updateDeliverables: async (data: any): Promise<any> => {
    const response = await apiClient.post("/services/deliverables/update", data);
    return response.data.data;
  },

  updateServicesMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/services/update", data);
    return response.data.data;
  },
};
