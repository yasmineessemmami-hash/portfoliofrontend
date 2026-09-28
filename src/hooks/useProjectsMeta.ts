import { useEffect, useState } from "react";
import { projectsService } from "@/services/projects.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseProjectsMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for Projects page.
 * Never blocks rendering - silently handles errors.
 */
export const useProjectsMeta = (): UseProjectsMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await projectsService.getProjectsMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Projects SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
