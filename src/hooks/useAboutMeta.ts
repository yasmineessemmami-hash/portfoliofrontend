import { useEffect, useState } from "react";
import { aboutService } from "@/services/about.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseAboutMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for About page.
 * Never blocks rendering - gracefully handles errors and delays.
 */
export const useAboutMeta = (): UseAboutMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await aboutService.getAboutMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        console.warn("About SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};


