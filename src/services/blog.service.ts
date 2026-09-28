import apiClient from "@/services/api";
import type { BlogResponse } from "@/types/blog.types";
import type { MetaResponse } from "@/types/seo.types";

export const blogService = {
  getBlogData: async (): Promise<BlogResponse> => {
    const response = await apiClient.post("/blog");
    // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
    return response.data.data || response.data;
  },

  getBlogList: async (): Promise<BlogResponse> => {
    const response = await apiClient.post("/blog");
    // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
    return response.data.data || response.data;
  },

  getArticle: async (slug: string): Promise<any> => {
    const response = await apiClient.post(`/blog/article/${slug}`);
    return response.data.data || response.data;
  },

  getAuthor: async (): Promise<any> => {
    try {
      const response = await apiClient.post("/blog");
      const blogData = response.data.data || response.data;
      if (blogData?.author) {
        // Map author data to match AuthorInfo structure
        return {
          author: {
            full_name: blogData.author.name || "",
            role: "Author",
            bio: blogData.author.bio || "",
            avatar: {
              image_url: blogData.author.avatar || "",
              alt: blogData.author.name || "Author"
            },
            social_links: Array.isArray(blogData.author.social_links) 
              ? blogData.author.social_links.map((link: any) => ({
                  platform: link.platform || link.name || "",
                  url: link.url || "",
                  icon_key: link.icon_key || link.icon || ""
                }))
              : []
          }
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  getBlogMeta: async (locale: "en" | "ar" = "en"): Promise<any | null> => {
    try {
      const response = await apiClient.post("/meta/pages/blog", { locale });
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  getArticleMeta: async (_slug: string): Promise<MetaResponse | null> => {
    try {
      // For now, return blog page meta as fallback since article-specific meta may not exist
      // In the future, this could be extended to fetch article-specific meta if needed
      const response = await apiClient.post("/meta/pages/blog", { locale: "en" });
      if (response.data.data) {
        return {
          meta: {
            en: response.data.data,
            ar: response.data.data, // Use same data for both locales if ar is not available
          },
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  updateBlogHero: async (data: any): Promise<any> => {
    const response = await apiClient.post("/blog/hero/update", data);
    return response.data;
  },

  updateBlogAuthor: async (data: any): Promise<any> => {
    const response = await apiClient.post("/blog/author/update", data);
    return response.data;
  },

  addBlogPost: async (data: any): Promise<any> => {
    const response = await apiClient.post("/blog/posts/add", data);
    return response.data;
  },

  updateBlogPost: async (data: any): Promise<any> => {
    const response = await apiClient.post("/blog/posts/update", data);
    return response.data;
  },

  deleteBlogPost: async (id: number): Promise<any> => {
    const response = await apiClient.post("/blog/posts/delete", { id });
    return response.data;
  },

  updateBlogMeta: async (data: any): Promise<any> => {
    const response = await apiClient.post("/meta/pages/blog/update", data);
    return response.data;
  },

  subscribe: async (email: string): Promise<any> => {
    const response = await apiClient.post("/blog/subscribe", { email });
    return response.data;
  },
};
