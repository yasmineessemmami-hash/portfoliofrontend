import { useEffect, useState } from "react";
import { contactService } from "@/services/contact.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseContactMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for Contact page.
 * Never blocks rendering - silently handles errors.
 */
export const useContactMeta = (): UseContactMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await contactService.getContactMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        // eslint-disable-next-line no-console
        console.warn("Contact SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
