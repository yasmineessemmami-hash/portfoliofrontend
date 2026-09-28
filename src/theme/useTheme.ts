import { useState, useEffect } from "react";
import { useSiteConfigContext } from "@/context/SiteConfigContext";
import type { ThemeName } from "@/seasonal/themeRegistry";

export type SeasonalTheme = ThemeName | null;

export interface ThemeEventResponse {
  name: string;
  theme?: string; // Event mode: "christmas", "normal", or missing
}

interface UseThemeReturn {
  seasonalTheme: SeasonalTheme;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch seasonal/event theme from /api/v1/site/configurations
 * 
 * This hook fetches ONCE at app startup and extracts the event mode.
 * The `theme.key` field determines which seasonal experience to enable:
 * - "christmas" → enable Christmas experience
 * - "normal" OR missing → no seasonal experience
 * 
 * NOTE: This is separate from the palette theme system.
 * This hook is ONLY for seasonal/event experiences.
 */
export const useTheme = (): UseThemeReturn => {
  const { siteConfig, loading: siteConfigLoading } = useSiteConfigContext();
  const [seasonalTheme, setSeasonalTheme] = useState<SeasonalTheme>(null);

  useEffect(() => {
    if (siteConfigLoading) {
      return; // Wait for site config to load
    }

    // Extract theme key from site configurations (already fetched in context)
    const themeValue = siteConfig?.site_configurations?.themes?.theme?.key;
    
    // Map theme value to SeasonalTheme type
    // Support: christmas, easter, ramadan, new_year, normal
    const validThemes: ThemeName[] = ["christmas", "easter", "ramadan", "new_year", "normal"];
    if (themeValue && validThemes.includes(themeValue as ThemeName)) {
      setSeasonalTheme(themeValue as ThemeName);
    } else {
      // Invalid or missing → no seasonal experience
      setSeasonalTheme("normal");
    }
  }, [siteConfig, siteConfigLoading]);

  // Determine actual loading state: 
  // We are loading if siteConfig is loading OR seasonalTheme hasn't been determined yet
  const isActuallyLoading = siteConfigLoading || seasonalTheme === null;

  return { seasonalTheme, loading: isActuallyLoading, error: null };
};

