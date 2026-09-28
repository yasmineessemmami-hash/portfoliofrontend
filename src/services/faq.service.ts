import apiClient from "@/services/api";
import type { FAQResponse } from "@/types/faq.types";

export const faqService = {
  getFAQData: async (): Promise<FAQResponse> => {
    const response = await apiClient.post<{ data?: FAQResponse } | FAQResponse>("/faq");
    // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
    return (response.data as any).data || response.data;
  },

  getFAQMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/faq", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateFAQHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/faq/hero/update", data);
    return response.data;
  },

  updateFAQItems: async (data: any): Promise<any> => {
    const response = await apiClient.post("/faq/items/update", data);
    return response.data;
  },

  updateFAQMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/faq/update", data);
    return response.data;
  },
};
