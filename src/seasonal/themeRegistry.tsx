import { lazy } from "react";
import type { ComponentType } from "react";

/**
 * Theme Registry
 * 
 * Centralized registry for all seasonal/event themes.
 * To add a new theme:
 * 1. Create folder: src/seasonal/{theme_name}/
 * 2. Create Intro component: {ThemeName}Intro.tsx
 * 3. Create overlay component (optional): {ThemeName}Overlay.tsx
 * 4. Add entry to themeRegistry below
 */

// Lazy load theme components for better performance
// Note: Components are named exports, so we wrap them as default
const ChristmasIntro = lazy(() => 
  import("./christmas/ChristmasIntro").then(module => ({ default: module.ChristmasIntro }))
);
const SnowOverlay = lazy(() => 
  import("./christmas/SnowOverlay").then(module => ({ default: module.SnowOverlay }))
);

// Import CSS for each theme
import "@/seasonal/christmas/snow.css";

export type ThemeName = "christmas" | "easter" | "ramadan" | "new_year" | "normal";

export interface ThemeComponents {
  Intro: ComponentType<{ onComplete?: () => void }>;
  Overlay?: ComponentType;
  css?: string; // Path to CSS file if needed
}

/**
 * Theme Registry Map
 * Maps theme names to their components
 */
export const themeRegistry: Record<ThemeName, ThemeComponents | null> = {
  christmas: {
    Intro: ChristmasIntro,
    Overlay: SnowOverlay,
  },
  easter: null, // TODO: Add Easter theme components
  ramadan: null, // TODO: Add Ramadan theme components
  new_year: null, // TODO: Add New Year theme components
  normal: null, // No seasonal experience
};

/**
 * Get theme components for a given theme name
 */
export const getThemeComponents = (themeName: ThemeName): ThemeComponents | null => {
  return themeRegistry[themeName] || null;
};

/**
 * Check if a theme has an intro component
 */
export const hasIntro = (themeName: ThemeName): boolean => {
  return themeRegistry[themeName]?.Intro !== undefined;
};

/**
 * Check if a theme has an overlay component
 */
export const hasOverlay = (themeName: ThemeName): boolean => {
  return themeRegistry[themeName]?.Overlay !== undefined;
};

