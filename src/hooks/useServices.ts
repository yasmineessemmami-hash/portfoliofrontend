import { useEffect, useState } from "react";
import { servicesService } from "@/services/services.service";
import type { ServicesResponse } from "@/types/services.types";

interface UseServicesReturn {
  data: ServicesResponse | null;
  loading: boolean;
  error: string | null;
}

export const useServices = (): UseServicesReturn => {
  const [data, setData] = useState<ServicesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await servicesService.getServicesData();
        
        if (res) {
          // Map backend response to ensure frontend fields like icon_key are consistently populated
          const mappedData: ServicesResponse = {
            hero: res.hero || { title: "", subtitle: "" },
            services: (res.services || []).map((s: any) => ({
              ...s,
              icon_key: s.icon_key || s.key || "icon-globe" // Fallback for icons
            })),
            why_choose_me: (res.why_choose_me || []).map((w: any) => ({
              ...w,
              icon_key: w.icon_key || w.key || "icon-zap"
            })),
            deliverables: (res.deliverables || []).map((d: any) => ({
              ...d,
              icon_key: d.icon_key || d.key || "icon-package"
            }))
          };
          setData(mappedData);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch services page data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
