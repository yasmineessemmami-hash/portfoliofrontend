import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import type { AuthorResponse } from "@/types/blog.types";

interface UseBlogAuthorReturn {
  data: AuthorResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch author information for blog articles.
 * Author data is optional - gracefully handles missing endpoint.
 */
export const useBlogAuthor = (): UseBlogAuthorReturn => {
  const [data, setData] = useState<AuthorResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blogService.getAuthor();
        setData(response);
      } catch (err) {
        // Service already handles errors gracefully, but catch any unexpected errors
        setError(
          err instanceof Error ? err.message : "Failed to fetch author data"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
