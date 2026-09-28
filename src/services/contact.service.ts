import apiClient from "@/services/api";
import type { ContactResponse } from "@/types/contact.types";

export const contactService = {
  getContactData: async (): Promise<ContactResponse> => {
    const response = await apiClient.post<{ data?: ContactResponse } | ContactResponse>("/contact");
    // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
    return (response.data as any).data || response.data;
  },

  getContactMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/contact", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  updateContactHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/contact/hero/update", data);
    return response.data;
  },

  updateContactInfos: async (data: any): Promise<any> => {
    const response = await apiClient.post("/contact/infos/update", data);
    return response.data;
  },

  updateContactMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/contact/update", data);
    return response.data;
  },

  updateContactSocialLinks: async (data: any): Promise<any> => {
    const response = await apiClient.post("/contact/social-links/update", data);
    return response.data;
  },

  submitContactForm: async (data: any): Promise<any> => {
    const response = await apiClient.post("/contact/submit", data);
    return response.data;
  },

  getContactSubmissions: async (): Promise<any> => {
    const response = await apiClient.post("/contact/submissions");
    return response.data;
  },

  markSubmissionAsRead: async (id: number): Promise<any> => {
    const response = await apiClient.post("/contact/submissions/mark-read", { id });
    return response.data;
  },
};
