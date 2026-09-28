import { useEffect, useState } from "react";
import { servicesService } from "@/services/services.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseServicesMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for Services page.
 * Never blocks rendering - gracefully handles errors and delays.
 */
export const useServicesMeta = (): UseServicesMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await servicesService.getServicesMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        console.warn("Services SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
