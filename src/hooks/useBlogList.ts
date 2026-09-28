import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import type { BlogListResponse, BlogPost } from "@/types/blog.types";

interface UseBlogListReturn {
  data: BlogListResponse | null;
  loading: boolean;
  error: string | null;
}

export const useBlogList = (): UseBlogListReturn => {
  const [data, setData] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blogService.getBlogList();
        
        // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
        // blogService.getBlogList() already extracts response.data.data || response.data
        const res = response;
        
        if (res) {
          // Map backend response to ensure consistent field names including media_type
          const mappedData: BlogListResponse = {
            hero: res.hero || { title: "", subtitle: "" },
            posts: (res.posts || []).map((p: any): BlogPost => ({
              id: p.id,
              slug: p.slug || "",
              title: p.title || "",
              excerpt: p.excerpt || "",
              date: p.date || p.published_at || "",
              read_time: p.read_time || "5 min read",
              tags: Array.isArray(p.tags) ? p.tags : [],
              image: p.image || "",
              media_type: p.media_type || "image"
            }))
          };
          setData(mappedData);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch blog data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
