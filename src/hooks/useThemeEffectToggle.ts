import { useState, useEffect } from "react";

/**
 * Generic hook to manage theme effect toggle state (snow, easter effects, etc.)
 * Uses localStorage to remember user preference (one-time, not saved in backend)
 * 
 * @param themeName - Theme name (e.g., "christmas", "easter")
 * @param effectName - Effect name (e.g., "snow", "particles")
 * @returns { effectEnabled, toggleEffect }
 */
export const useThemeEffectToggle = (themeName: string, effectName: string) => {
  const STORAGE_KEY = `${themeName}-${effectName}-disabled`;

  const [effectEnabled, setEffectEnabled] = useState<boolean>(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "disabled") {
      // User has disabled the effect
      setEffectEnabled(false);
    } else {
      // Default: effect is enabled (or no preference saved)
      setEffectEnabled(true);
    }
  }, [STORAGE_KEY]);

  const toggleEffect = () => {
    setEffectEnabled((prev) => {
      const newValue = !prev;
      // Save to localStorage: "disabled" means effect is off, missing means enabled
      if (newValue) {
        localStorage.removeItem(STORAGE_KEY); // Remove to enable (default state)
      } else {
        localStorage.setItem(STORAGE_KEY, "disabled"); // Save "disabled" to turn off
      }
      return newValue;
    });
  };

  return {
    effectEnabled,
    toggleEffect,
  };
};

