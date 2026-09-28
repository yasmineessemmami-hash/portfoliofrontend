import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import type { MetaResponse } from "@/types/seo.types";

interface UseBlogArticleMetaReturn {
  meta: MetaResponse["meta"]["en"] | null;
  loading: boolean;
}

/**
 * Hook to fetch SEO metadata for Blog Article page.
 * Never blocks rendering - silently handles errors.
 */
export const useBlogArticleMeta = (slug: string): UseBlogArticleMetaReturn => {
  const [meta, setMeta] = useState<MetaResponse["meta"]["en"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchMeta = async () => {
      try {
        setLoading(true);
        const response = await blogService.getArticleMeta(slug);
        if (response?.meta?.en) {
          setMeta(response.meta.en);
        }
      } catch (error) {
        // Silently fail - SEO metadata is optional
        // eslint-disable-next-line no-console
        console.warn(
          `Blog article SEO metadata fetch failed for ${slug}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [slug]);

  return { meta, loading };
};
