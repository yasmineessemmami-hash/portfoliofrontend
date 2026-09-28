import { useEffect, useState } from "react";
import { aboutService } from "@/services/about.service";
import type { AboutResponse } from "@/types/about.types";

interface UseAboutReturn {
  data: AboutResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAbout = (): UseAboutReturn => {
  const [data, setData] = useState<AboutResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await aboutService.getAboutData();
        
        if (res) {
          // Map backend response to handle potential icon key name differences
          const mappedData: AboutResponse = {
            ...res,
            stats: (res.stats || []).map((s: any) => ({
              ...s,
              key: s.key || s.icon_key || "icon-folder"
            })),
            values: (res.values || []).map((v: any) => ({
              ...v,
              key: v.key || v.icon_key || "icon-heart"
            }))
          };
          setData(mappedData);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch about page data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};


