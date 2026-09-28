import type { SiteConfigurationsResponse } from "@/types/common.types";

/**
 * Apply theme palette to document root
 *
 * Backend provides keys like "--color-background" with HSL values like "220 25% 6%"
 * We set them directly on :root, which will override the defaults in @theme
 *
 * Tailwind v4 @theme will use these runtime values if set, otherwise fallback to CSS defaults
 */
export const applyTheme = (siteConfig: SiteConfigurationsResponse | null): void => {
  // If site config is null or no theme palette, use default from CSS (no action needed)
  if (!siteConfig || !siteConfig.site_configurations.themes.theme_palette?.palette) {
    return;
  }

  const palette = siteConfig.site_configurations.themes.theme_palette.palette;
  const root = document.documentElement;

  // Apply each palette color to :root as CSS variable
  // This will override the defaults in @theme at runtime
  Object.entries(palette).forEach(([key, value]) => {
    // Backend provides keys like "--color-background" with HSL values like "220 25% 6%"
    // Wrap HSL values with hsl() function for CSS
    if (key.startsWith("--color-") || key.startsWith("--")) {
      root.style.setProperty(key, `hsl(${value})`);
    } else {
      // For non-color values (like --radius), use as-is
      root.style.setProperty(key, value);
    }
  });
};
