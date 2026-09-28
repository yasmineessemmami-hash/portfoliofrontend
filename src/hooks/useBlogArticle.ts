import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import type { ArticleResponse } from "@/types/blog.types";

interface UseBlogArticleReturn {
  data: ArticleResponse | null;
  loading: boolean;
  error: string | null;
}

export const useBlogArticle = (slug: string): UseBlogArticleReturn => {
  const [data, setData] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Slug is required");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blogService.getArticle(slug);
        // Handle Laravel response structure: { success: true, data: {...}, message: "..." }
        // Response should be { article: {...} }
        if (response && response.article) {
          setData({ article: response.article });
        } else {
          setData(response);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch article"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { data, loading, error };
};
