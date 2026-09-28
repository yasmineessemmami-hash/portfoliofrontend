import { useState, useEffect } from "react";
import { useSiteConfigContext } from "@/context/SiteConfigContext";
import type { CommonResponse } from "@/types/common.types";

interface UseCommonReturn {
  data: CommonResponse | null;
  loading: boolean;
  error: string | null;
}

export const useCommon = (): UseCommonReturn => {
  const {
    siteConfig,
    loading: siteConfigLoading,
    error: siteConfigError,
  } = useSiteConfigContext();
  const [data, setData] = useState<CommonResponse | null>(null);

  useEffect(() => {
    if (siteConfigLoading) {
      return; // Wait for site config to load
    }

    // Convert site config to CommonResponse format (no API call)
    if (!siteConfig) {
      setData({
        site: {
          mode: "normal",
          estimated_date: null,
          theme: "normal",
        },
        full_name: "",
        contact: {
          email: "",
          phone: "",
        },
        social_links: [],
        seasonalTheme: null,
      });
      return;
    }

    const estimatedTime =
      siteConfig.site_configurations.maintenance_hours !== null &&
      siteConfig.site_configurations.maintenance_minutes !== null
        ? `${String(siteConfig.site_configurations.maintenance_hours).padStart(
            2,
            "0"
          )}:${String(
            siteConfig.site_configurations.maintenance_minutes
          ).padStart(2, "0")}`
        : null;

    setData({
      site: {
        mode: siteConfig.site_configurations.site_mode,
        estimated_date: null,
        estimated_time: estimatedTime,
        maintenance_until: siteConfig.site_configurations.maintenance_until,
        theme: siteConfig.site_configurations.themes.theme?.key || "normal",
      },
      full_name: siteConfig.personal_information.full_name || "",
      contact: {
        email: siteConfig.personal_information.contact_email || "",
        phone: siteConfig.personal_information.contact_phone || "",
      },
      social_links: siteConfig.personal_information.social_links.map(
        (link) => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          icon_key: link.icon_key,
          sort_order: link.sort_order,
        })
      ),
      seasonalTheme: siteConfig.site_configurations.themes.theme?.key || null,
    });
  }, [siteConfig, siteConfigLoading]);

  // Determine actual loading state:
  // We are loading if siteConfig is loading OR data hasn't been transformed yet
  const isActuallyLoading = siteConfigLoading || (siteConfig && data === null);

  return { data, loading: !!isActuallyLoading, error: siteConfigError };
};
