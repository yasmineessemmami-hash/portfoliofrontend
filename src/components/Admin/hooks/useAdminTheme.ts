import { useMemo } from "react";
import { useSiteConfigContext } from "@/context/SiteConfigContext";
import type { ThemeResponse } from "@/services/theme.service";

interface UseAdminThemeReturn {
  theme: ThemeResponse | null;
  loading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

/**
 * Hook to fetch and manage admin theme state
 * Fetches theme from POST /api/v1/site/configurations and extracts theme data
 */
export const useAdminTheme = (): UseAdminThemeReturn => {
  const {
    siteConfig,
    loading: siteConfigLoading,
    error: siteConfigError,
    refresh,
  } = useSiteConfigContext();

  const theme = useMemo<ThemeResponse | null>(() => {
    if (siteConfigLoading || !siteConfig) {
      return null;
    }

    // Extract theme data from site configurations (already fetched in context)
    const themeData = siteConfig.site_configurations.themes.theme;
    const themePaletteData =
      siteConfig.site_configurations.themes.theme_palette;

    // Convert to ThemeResponse format
    const themeResponse: ThemeResponse = {
      name: themeData?.name || "Default",
      theme: themeData?.key || "normal",
      palette: themePaletteData?.palette || undefined,
    };

    return themeResponse;
  }, [siteConfig, siteConfigLoading]);

  const refreshTheme = async () => {
    await refresh();
  };

  return {
    theme,
    loading: siteConfigLoading,
    error: siteConfigError,
    refreshTheme,
  };
};
