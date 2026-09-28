import apiClient from "@/services/api";

export interface ThemePalette {
  [key: string]: string; // CSS variable name -> HSL value (without hsl())
}

export interface ThemeResponse {
  name: string;
  palette?: ThemePalette; // Optional - may not be present if only event theme is returned
  theme?: string; // Event mode: "christmas", "normal", etc. (for seasonal experiences)
}

/**
 * Fetch theme palette from backend
 * GET /api/v1/theme
 * Falls back gracefully if endpoint doesn't exist
 */
export const themeService = {
  /**
   * Fetch theme palette from backend
   * GET /api/v1/theme
   * Falls back gracefully if endpoint doesn't exist
   *
   * NOTE: This service is for the PALETTE theme system (colors).
   * For seasonal/event themes, use the useTheme hook instead.
   */
  getTheme: async (): Promise<ThemeResponse | null> => {
    try {
      const response = await apiClient.get<ThemeResponse>("/theme");
      return response.data;
    } catch (error) {
      // Silently fail - default theme from CSS will be used
      console.warn(
        "Theme endpoint not available, using default theme from CSS",
        error
      );
      return null;
    }
  },
};
