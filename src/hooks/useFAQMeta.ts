import { useEffect, useState } from "react";
import { faqService } from "@/services/faq.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseFAQMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for FAQ page.
 * Never blocks rendering - silently handles errors.
 */
export const useFAQMeta = (): UseFAQMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await faqService.getFAQMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        // eslint-disable-next-line no-console
        console.warn("FAQ SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
