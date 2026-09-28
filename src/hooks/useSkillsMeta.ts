import { useEffect, useState } from "react";
import { skillsService } from "@/services/skills.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseSkillsMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for Skills page.
 * Never blocks rendering - silently handles errors.
 */
export const useSkillsMeta = (): UseSkillsMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await skillsService.getSkillsMeta();
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Skills SEO metadata fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  return { meta, loading };
};
