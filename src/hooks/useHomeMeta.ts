import { useState, useEffect } from "react";
import { homeService } from "@/services/home.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseHomeMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for home page
 * Never blocks rendering - gracefully handles errors and delays
 */
export const useHomeMeta = (): UseHomeMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomeMeta();
        if (response) {
          // homeService.getHomeMeta() returns MetaPageData, not MetaResponse
          // Convert MetaPageData to MetaResponse["meta"]["en"] format
          setMeta({
            title: response.title,
            description: response.description,
            keywords: response.keywords || []
          });
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        console.warn("SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
