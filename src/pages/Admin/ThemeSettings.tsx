import { useState, useEffect } from "react";
import {
  Palette,
  Save,
  CheckCircle,
  Eye,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Settings,
  Power,
  Undo2,
  Plus,
  Clock,
  Terminal,
  Play,
  Edit,
  Copy,
  Check,
} from "lucide-react";
import { commonService } from "@/services/common.service";
import type { ThemeResponse } from "@/services/theme.service";
import type { CommonResponse } from "@/types/common.types";
import { AdminCard, AdminButton, AdminInput, AdminToggle } from "@/components/Admin";
import { useCommonContext } from "@/context/CommonContext";
import { useSiteConfigContext } from "@/context/SiteConfigContext";

// Helper: Convert HSL string "H S% L%" to hex
const hslToHex = (hsl: string): string => {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!match) return "#000000";
  
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Helper: Convert hex to HSL string "H S% L%"
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const radiusOptions = ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem"];

// Default theme palette values from CSS (HSL format without hsl() wrapper)
const defaultThemePalette: Record<string, string> = {
  "--color-background": "220 25% 6%",
  "--color-foreground": "210 20% 98%",
  "--color-card": "220 25% 10%",
  "--color-card-foreground": "210 20% 98%",
  "--color-popover": "220 25% 10%",
  "--color-popover-foreground": "210 20% 98%",
  "--color-primary": "175 70% 45%",
  "--color-primary-foreground": "220 25% 6%",
  "--color-secondary": "220 20% 14%",
  "--color-secondary-foreground": "210 20% 90%",
  "--color-muted": "220 15% 20%",
  "--color-muted-foreground": "215 15% 55%",
  "--color-accent": "175 60% 35%",
  "--color-accent-foreground": "210 20% 98%",
  "--color-destructive": "0 84.2% 60.2%",
  "--color-destructive-foreground": "210 40% 98%",
  "--color-border": "220 15% 18%",
  "--color-input": "220 15% 18%",
  "--color-ring": "175 70% 45%",
  "--color-glow": "175 70% 45%",
  "--color-surface": "220 25% 12%",
  "--color-surface-hover": "220 25% 16%",
  "--color-text-primary": "210 20% 98%",
  "--color-text-secondary": "215 15% 65%",
  "--color-text-muted": "215 10% 45%",
  "--color-success": "142 76% 36%",
  "--color-error": "0 84.2% 60.2%",
  "--color-warning": "38 92% 50%",
  "--radius": "0.75rem",
};

interface ThemePaletteItem {
  id: number;
  name: string;
  palette: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ThemeItem {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminThemeSettings = () => {
  const [, setThemeData] = useState<ThemeResponse | null>(null);
  const [commonData, setCommonData] = useState<CommonResponse | null>(null);
  const [allThemes, setAllThemes] = useState<ThemeItem[]>([]);
  const [allPalettes, setAllPalettes] = useState<ThemePaletteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);
  const [maintenanceHours, setMaintenanceHours] = useState<number | "">(0);
  const [maintenanceMinutes, setMaintenanceMinutes] = useState<number | "">(0);
  const [terminalMode, setTerminalMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [applyingJson, setApplyingJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activatingPalette, setActivatingPalette] = useState<number | null>(null);
  const [previewingPaletteId, setPreviewingPaletteId] = useState<number | null>(null);
  const [previewPaletteBackup, setPreviewPaletteBackup] = useState<{
    palette: Record<string, string>;
    themeName: string;
    radius: string;
  } | null>(null);

  // Form state
  const [themeName, setThemeName] = useState("");
  const [palette, setPalette] = useState<Record<string, string>>({});
  const [radius, setRadius] = useState("0.75rem");
  const [activeEventTheme, setActiveEventTheme] = useState<string>("normal");

  // Get common data and site config from context (already fetched in App.tsx)
  const { common: commonDataFromContext } = useCommonContext();
  const { siteConfig: siteConfigFromContext, themes: themesFromContext, loading: siteConfigLoading, refresh: refreshSiteConfig } = useSiteConfigContext();

  useEffect(() => {
    const fetchData = async () => {
      // Wait for context data to be loaded
      if (siteConfigLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use themes from context (already fetched in SiteConfigProvider)
        // Site config and common data are already available from context (fetched in App.tsx)
        const themesResponse = themesFromContext || { themes: [], theme_palettes: [] };
        
        // Use site config from context instead of fetching again
        const siteConfigResponse = siteConfigFromContext;

        // Extract theme data from site configurations
        let themeResponse: ThemeResponse | null = null;
        if (siteConfigResponse) {
          const themeData = siteConfigResponse.site_configurations.themes.theme;
          const themePaletteData = siteConfigResponse.site_configurations.themes.theme_palette;
          
          themeResponse = {
            name: themePaletteData?.name || "Default",
            theme: themeData?.key || "normal",
            palette: themePaletteData?.palette || defaultThemePalette,
          };

          setActiveEventTheme(themeData?.key || "normal");
        }

        setThemeData(themeResponse);
        
        // Set all themes and palettes from themesResponse
        setAllThemes(themesResponse.themes || []);
        setAllPalettes(themesResponse.theme_palettes || []);
        
        // Use common data from context if available, otherwise convert from site config
        if (commonDataFromContext) {
          setCommonData(commonDataFromContext);
        } else if (siteConfigResponse) {
          // Convert site config to common response format if context doesn't have it
          const estimatedTime = siteConfigResponse.site_configurations.maintenance_hours !== null && 
                               siteConfigResponse.site_configurations.maintenance_minutes !== null
            ? `${String(siteConfigResponse.site_configurations.maintenance_hours).padStart(2, '0')}:${String(siteConfigResponse.site_configurations.maintenance_minutes).padStart(2, '0')}`
            : null;

          setCommonData({
            site: {
              mode: siteConfigResponse.site_configurations.site_mode,
              estimated_date: null,
              estimated_time: estimatedTime,
              theme: siteConfigResponse.site_configurations.themes.theme?.key || "normal",
            },
            full_name: siteConfigResponse.personal_information.full_name || "",
            contact: {
              email: siteConfigResponse.personal_information.contact_email || "",
              phone: siteConfigResponse.personal_information.contact_phone || "",
            },
            social_links: siteConfigResponse.personal_information.social_links.map(link => ({
              platform: link.platform,
              url: link.url,
            })),
            seasonalTheme: siteConfigResponse.site_configurations.themes.theme?.key || null,
          });

          // Initialize local maintenance time state from site config
          if (siteConfigResponse.site_configurations.maintenance_hours !== null) {
            setMaintenanceHours(siteConfigResponse.site_configurations.maintenance_hours);
          }
          if (siteConfigResponse.site_configurations.maintenance_minutes !== null) {
            setMaintenanceMinutes(siteConfigResponse.site_configurations.maintenance_minutes);
          }
        }

        // Initialize form state from backend data
        if (themeResponse?.palette) {
        setThemeName(themeResponse.name || "");
          setPalette(themeResponse.palette);
          setRadius(themeResponse.palette["--radius"] || "0.75rem");
          // Initialize JSON input with current palette
          setJsonInput(JSON.stringify(themeResponse.palette, null, 2));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch theme settings"
        );
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if site config is loaded (to avoid fetching when context is still loading)
    if (!siteConfigLoading) {
    fetchData();
    }
  }, [commonDataFromContext, siteConfigFromContext, themesFromContext, siteConfigLoading]);

  const updateColor = (key: string, value: string) => {
    setPalette({ ...palette, [key]: value });
  };

  const handleResetPalette = () => {
    // Find the currently active palette from the loaded list
    const activePalette = allPalettes.find((p) => p.is_active);

    if (activePalette) {
      // Revert frontend state to the active palette values
      setPalette(activePalette.palette);
      setThemeName(activePalette.name);
      setRadius(activePalette.palette["--radius"] || "0.75rem");
      
      // Update JSON input if in terminal mode
      setJsonInput(JSON.stringify(activePalette.palette, null, 2));
      
      setSaveMessage("Changes discarded and reset to active theme.");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      // Fallback if no active palette is found (shouldn't happen)
    setPalette(defaultThemePalette);
    setRadius(defaultThemePalette["--radius"] || "0.75rem");
      setJsonInput(JSON.stringify(defaultThemePalette, null, 2));
    }
  };

  const handleRestoreDefault = async () => {
    try {
      setSaving(true);
      await commonService.restoreDefaultThemePalette();
      
      // Refresh data - use context refresh instead of calling API directly
      const { siteConfig: refreshedConfig, themes: refreshedThemes } = await refreshSiteConfig({ silent: true });
      const siteConfigResponse = refreshedConfig;
      const themesResponse = refreshedThemes || { themes: [], theme_palettes: [] };

      if (siteConfigResponse?.site_configurations.themes.theme_palette) {
        const paletteData = siteConfigResponse.site_configurations.themes.theme_palette;
        setThemeName(paletteData.name);
        setPalette(paletteData.palette);
        setRadius(paletteData.palette["--radius"] || "0.75rem");
      }
      
      setAllPalettes(themesResponse.theme_palettes);
      setSaveMessage("Default theme palette restored successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore default");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewPalette = async () => {
    const newName = prompt("Enter a name for the new palette:", `${themeName} (Copy)`);
    if (!newName || !newName.trim()) return;

    try {
      setSaving(true);
      const updatedPalette = { ...palette, "--radius": radius };
      await commonService.createNewThemePalette(newName.trim(), updatedPalette);
      
      // Refresh data - use context refresh instead of calling API directly
      const { siteConfig: refreshedConfig, themes: refreshedThemes } = await refreshSiteConfig({ silent: true });
      const siteConfigResponse = refreshedConfig;
      const themesResponse = refreshedThemes || { themes: [], theme_palettes: [] };

      if (siteConfigResponse?.site_configurations.themes.theme_palette) {
        const paletteData = siteConfigResponse.site_configurations.themes.theme_palette;
        setThemeName(paletteData.name);
        setPalette(paletteData.palette);
        setRadius(paletteData.palette["--radius"] || "0.75rem");
      }
      
      setAllPalettes(themesResponse.theme_palettes);
      setSaveMessage("New palette created successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create new palette");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEventTheme = async (themeKey: string) => {
    // Optimistic update - update immediately
    const previousTheme = activeEventTheme;
    setActiveEventTheme(themeKey);
    setToggling(themeKey);
    
    try {
      await commonService.toggleEventTheme(themeKey);
      
      // Refresh themes from context
      const { themes: refreshedThemes } = await refreshSiteConfig({ silent: true });
      const themesResponse = refreshedThemes || { themes: [], theme_palettes: [] };
      setAllThemes(themesResponse.themes);
    } catch (err) {
      // Rollback on error
      setActiveEventTheme(previousTheme);
      setError(err instanceof Error ? err.message : "Failed to toggle event theme");
    } finally {
      setToggling(null);
    }
  };

  const handleToggleMaintenance = async (enabled: boolean) => {
    // Optimistic update - update immediately
    const previousMode = commonData?.site.mode || "normal";
    const newMode = enabled ? "maintenance" : "normal";
    
    if (commonData) {
      setCommonData({
        ...commonData,
        site: {
          ...commonData.site,
          mode: newMode,
        },
      });
    }
    setMaintenanceToggling(true);
    
    try {
      // Send optional estimation time when enabling maintenance mode
      const hours = enabled ? (Number(maintenanceHours) || 0) : null;
      const minutes = enabled ? (Number(maintenanceMinutes) || 0) : null;
      
      await commonService.toggleMaintenanceMode(newMode, hours, minutes);
      
      // Refresh site config from context instead of calling API directly
      const { siteConfig: refreshedConfig } = await refreshSiteConfig({ silent: true });
      const siteConfigResponse = refreshedConfig;
      if (siteConfigResponse) {
        const estimatedTime = siteConfigResponse.site_configurations.maintenance_hours !== null && 
                             siteConfigResponse.site_configurations.maintenance_minutes !== null
          ? `${String(siteConfigResponse.site_configurations.maintenance_hours).padStart(2, '0')}:${String(siteConfigResponse.site_configurations.maintenance_minutes).padStart(2, '0')}`
          : null;

        setCommonData({
          site: {
            mode: siteConfigResponse.site_configurations.site_mode,
            estimated_date: null,
            estimated_time: estimatedTime,
            theme: siteConfigResponse.site_configurations.themes.theme?.key || "normal",
          },
          full_name: siteConfigResponse.personal_information.full_name || "",
          contact: {
            email: siteConfigResponse.personal_information.contact_email || "",
            phone: siteConfigResponse.personal_information.contact_phone || "",
          },
          social_links: siteConfigResponse.personal_information.social_links.map(link => ({
            platform: link.platform,
            url: link.url,
          })),
          seasonalTheme: siteConfigResponse.site_configurations.themes.theme?.key || null,
        });

        // Update local maintenance time state from server response
        if (siteConfigResponse.site_configurations.maintenance_hours !== null) {
          setMaintenanceHours(siteConfigResponse.site_configurations.maintenance_hours);
        }
        if (siteConfigResponse.site_configurations.maintenance_minutes !== null) {
          setMaintenanceMinutes(siteConfigResponse.site_configurations.maintenance_minutes);
        }
      }
    } catch (err) {
      // Rollback on error
      if (commonData) {
        setCommonData({
          ...commonData,
          site: {
            ...commonData.site,
            mode: previousMode,
          },
        });
      }
      setError(err instanceof Error ? err.message : "Failed to toggle maintenance mode");
    } finally {
      setMaintenanceToggling(false);
    }
  };

  const handleApplyJson = async () => {
    // Cancel any active preview when applying JSON
    if (previewingPaletteId !== null) {
      handleCancelPreview();
    }
    
    try {
      setApplyingJson(true);
      setJsonError(null);

      // Parse JSON
      let parsedPalette: Record<string, string>;
      try {
        parsedPalette = JSON.parse(jsonInput);
      } catch (parseError) {
        setJsonError("Invalid JSON format. Please check your syntax.");
        return;
      }

      // Validate that it's an object with string values
      if (typeof parsedPalette !== "object" || parsedPalette === null || Array.isArray(parsedPalette)) {
        setJsonError("JSON must be an object with key-value pairs.");
        return;
      }

      // Validate all values are strings
      for (const [key, value] of Object.entries(parsedPalette)) {
        if (typeof value !== "string") {
          setJsonError(`Value for "${key}" must be a string.`);
          return;
        }
      }

      // Update local palette state (this will update the preview)
      setPalette(parsedPalette);
      if (parsedPalette["--radius"]) {
        setRadius(parsedPalette["--radius"]);
      }

      setJsonError(null);
      setSaveMessage("Palette applied to preview! Click 'Save Theme' to persist changes.");
      setTimeout(() => setSaveMessage(""), 5000);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Failed to apply JSON");
    } finally {
      setApplyingJson(false);
    }
  };

  const handleToggleTerminalMode = () => {
    setTerminalMode(!terminalMode);
    setJsonError(null);
    // When switching to terminal mode, update JSON input with current palette
    if (!terminalMode) {
      setJsonInput(JSON.stringify(palette, null, 2));
    }
  };

  const handlePreviewPalette = (paletteItem: ThemePaletteItem) => {
    // Cancel any existing preview first
    if (previewingPaletteId !== null) {
      handleCancelPreview();
    }

    // Backup current palette state
    setPreviewPaletteBackup({
      palette: { ...palette },
      themeName,
      radius,
    });

    // Apply preview palette temporarily
    setPalette(paletteItem.palette);
    setThemeName(paletteItem.name);
    if (paletteItem.palette["--radius"]) {
      setRadius(paletteItem.palette["--radius"]);
    } else {
      setRadius("0.75rem");
    }
    
    // Update JSON input if in terminal mode
    if (terminalMode) {
      setJsonInput(JSON.stringify(paletteItem.palette, null, 2));
    }

    setPreviewingPaletteId(paletteItem.id);
  };

  const handleCancelPreview = () => {
    if (previewPaletteBackup) {
      // Restore original palette
      setPalette(previewPaletteBackup.palette);
      setThemeName(previewPaletteBackup.themeName);
      setRadius(previewPaletteBackup.radius);
      
      // Update JSON input if in terminal mode
      if (terminalMode) {
        setJsonInput(JSON.stringify(previewPaletteBackup.palette, null, 2));
      }
      
      setPreviewPaletteBackup(null);
    }
    setPreviewingPaletteId(null);
  };

  const handleActivatePalette = async (paletteItem: ThemePaletteItem) => {
    try {
      setActivatingPalette(paletteItem.id);
      
      // Cancel preview if active
      if (previewingPaletteId !== null) {
        setPreviewPaletteBackup(null);
        setPreviewingPaletteId(null);
      }
      
      // Optimistic update - update preview immediately
      setPalette(paletteItem.palette);
      setThemeName(paletteItem.name);
      if (paletteItem.palette["--radius"]) {
        setRadius(paletteItem.palette["--radius"]);
      }
      // Update JSON input if in terminal mode
      if (terminalMode) {
        setJsonInput(JSON.stringify(paletteItem.palette, null, 2));
      }

      // Activate palette in backend
      await commonService.activateThemePalette(paletteItem.id);
      
      // Refresh data - use context refresh instead of calling API directly
      const { siteConfig: refreshedConfig, themes: refreshedThemes } = await refreshSiteConfig({ silent: true });
      const siteConfigResponse = refreshedConfig;
      const themesResponse = refreshedThemes || { themes: [], theme_palettes: [] };

      if (siteConfigResponse?.site_configurations.themes.theme_palette) {
        const paletteData = siteConfigResponse.site_configurations.themes.theme_palette;
        setPalette(paletteData.palette);
        setThemeName(paletteData.name);
        setRadius(paletteData.palette["--radius"] || "0.75rem");
      }
      
      setAllPalettes(themesResponse.theme_palettes);
      setSaveMessage(`Palette "${paletteItem.name}" activated successfully!`);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      // Rollback on error
      const activePalette = allPalettes.find((p) => p.is_active);
      if (activePalette) {
        setPalette(activePalette.palette);
        setThemeName(activePalette.name);
        if (activePalette.palette["--radius"]) {
          setRadius(activePalette.palette["--radius"]);
        }
      }
      setError(err instanceof Error ? err.message : "Failed to activate palette");
    } finally {
      setActivatingPalette(null);
    }
  };

  const handleSave = async () => {
    // Cancel any active preview when saving
    if (previewingPaletteId !== null) {
      handleCancelPreview();
    }
    
    try {
      setSaving(true);
      setSaveMessage("");
      
      // Save only palette (includes radius), theme name
      const updatedPalette = { ...palette, "--radius": radius };
      await commonService.updateThemePalette(themeName, updatedPalette);
      
      // Refresh data - use context refresh instead of calling API directly
      const { siteConfig: refreshedConfig, themes: refreshedThemes } = await refreshSiteConfig({ silent: true });
      const siteConfigResponse = refreshedConfig;
      const themesResponse = refreshedThemes || { themes: [], theme_palettes: [] };

      if (siteConfigResponse?.site_configurations.themes.theme_palette) {
        const paletteData = siteConfigResponse.site_configurations.themes.theme_palette.palette;
        setPalette(paletteData);
        setRadius(paletteData["--radius"] || "0.75rem");
        // Update JSON input to match saved palette
        setJsonInput(JSON.stringify(paletteData, null, 2));
      }
      
      setAllPalettes(themesResponse.theme_palettes);
    setSaveMessage("Theme saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  // Get color value for preview (convert HSL to hex if needed)
  const getColorValue = (hslValue: string): string => {
    if (hslValue.startsWith("#")) return hslValue;
    if (hslValue.startsWith("hsl(")) {
      const match = hslValue.match(/hsl\(([^)]+)\)/);
      if (match) return hslToHex(match[1]);
    }
    return hslToHex(hslValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminCard>
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Error loading theme settings
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminCard>
    );
  }

  // Filter palette to only show CSS variables
  const paletteEntries = Object.entries(palette).filter(([key]) =>
    key.startsWith("--")
  );

  // Get preview colors
  const previewColors = {
    background: palette["--color-background"] || "220 25% 6%",
    foreground: palette["--color-foreground"] || "210 20% 98%",
    primary: palette["--color-primary"] || "175 70% 45%",
    secondary: palette["--color-secondary"] || "220 20% 14%",
    accent: palette["--color-accent"] || "175 60% 35%",
    muted: palette["--color-muted"] || "220 15% 20%",
    border: palette["--color-border"] || "220 15% 18%",
  };

  // Get active palette
  const activePalette = allPalettes.find((p) => p.is_active);
  // Show all palettes (not just recent 5) - active palette first, then others sorted by updated_at
  const sortedPalettes = [...allPalettes].sort((a, b) => {
    // Active palette first
    if (a.is_active) return -1;
    if (b.is_active) return 1;
    // Then sort by updated_at (most recent first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-['Sora']">
            Theme Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your portfolio
          </p>
        </div>
      </div>

      {/* Active Theme Info */}
      {activePalette && (
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground font-['Sora'] mb-1">
                Active Theme: {activePalette.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(activePalette.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Configuration */}
        <div className="space-y-6">
          {/* Theme Name */}
          <AdminCard>
            <h2 className="text-lg font-semibold text-foreground font-['Sora'] mb-4">
              Theme Name
            </h2>
            <AdminInput
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="Enter theme name"
            />
          </AdminCard>

          {/* Event Themes */}
          <AdminCard>
            <h2 className="text-lg font-semibold text-foreground font-['Sora'] mb-4">
              Event / Seasonal Themes
            </h2>
            <div className="space-y-4">
              {allThemes.length > 0 ? (
                allThemes.map((theme) => (
                <AdminToggle
                    key={theme.key}
                    label={theme.name}
                    checked={activeEventTheme === theme.key}
                  onChange={async (e) => {
                    if (e.target.checked) {
                        await handleToggleEventTheme(theme.key);
                    }
                  }}
                    disabled={toggling === theme.key || (toggling !== null && toggling !== theme.key)}
                />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No event themes found in database.</p>
              )}
            </div>
          </AdminCard>

          {/* Color Palette */}
          <AdminCard>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-foreground font-['Sora']">
                Color Palette
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <AdminButton
                  onClick={handleToggleTerminalMode}
                  variant={terminalMode ? "primary" : "ghost"}
                  size="sm"
                  title={terminalMode ? "Switch to visual editor" : "Switch to JSON editor"}
                >
                  {terminalMode ? (
                    <>
                      <Edit className="w-4 h-4" />
                      Visual
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4" />
                      Terminal
                    </>
                  )}
                </AdminButton>
                <AdminButton
                  onClick={handleRestoreDefault}
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                >
                  <Undo2 className="w-4 h-4" />
                  Restore Default
                </AdminButton>
                <AdminButton
                  onClick={handleResetPalette}
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </AdminButton>
                <AdminButton
                  onClick={handleCreateNewPalette}
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4" />
                  New Palette
                </AdminButton>
              </div>
            </div>

            {terminalMode ? (
              /* Terminal/JSON Mode */
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Paste your palette JSON structure below
                  </p>
                  <AdminButton
                    onClick={handleApplyJson}
                    disabled={applyingJson || !jsonInput.trim()}
                    size="sm"
                  >
                    <Play className="w-4 h-4" />
                    {applyingJson ? "Applying..." : "Apply"}
                  </AdminButton>
                </div>

                {jsonError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setJsonError(null);
                    }}
                    placeholder={JSON.stringify(
                      {
                        "--color-background": "220 25% 6%",
                        "--color-foreground": "210 20% 98%",
                        "--color-primary": "175 70% 45%",
                        "--radius": "0.75rem",
                      },
                      null,
                      2
                    )}
                    className="w-full h-[500px] px-4 py-3 pr-24 bg-background border border-border rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(jsonInput);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          setJsonError("Failed to copy to clipboard");
                        }
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground bg-background/80 rounded transition-colors"
                      title="Copy JSON"
                      aria-label="Copy JSON to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      JSON
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    <strong>JSON Structure:</strong>
                  </p>
                  <pre className="text-xs text-foreground font-mono overflow-x-auto">
                    {`{
  "--color-background": "220 25% 6%",
  "--color-foreground": "210 20% 98%",
  "--color-primary": "175 70% 45%",
  "--radius": "0.75rem",
  ...
}`}
                  </pre>
                </div>
              </div>
            ) : (
              /* Visual Editor Mode */
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {paletteEntries.map(([key, value]) => {
                const isColor = key.startsWith("--color-");
                const hexValue = isColor ? getColorValue(value) : "";

                return (
                  <div key={key} className="flex items-center gap-4">
                    {isColor && (
                      <div
                          className="w-10 h-10 rounded-lg border border-border shrink-0"
                        style={{
                          backgroundColor: `hsl(${value})`,
                        }}
                      />
                    )}
                      <div className="flex-1 min-w-0">
                        <label className="text-sm font-medium text-foreground block mb-1 truncate">
                        {key}
                      </label>
                      <AdminInput
                          value={value}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    {isColor && (
                        <label className="block shrink-0" title={`Color picker for ${key}`}>
                      <input
                        type="color"
                        value={hexValue}
                        onChange={(e) => {
                          const hslValue = hexToHsl(e.target.value);
                          updateColor(key, hslValue);
                        }}
                            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                            aria-label={`Color picker for ${key}`}
                      />
                        </label>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </AdminCard>

          {/* Border Radius */}
          <AdminCard>
            <h2 className="text-lg font-semibold text-foreground font-['Sora'] mb-4">
              Border Radius
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRadius(r);
                    updateColor("--radius", r);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap ${
                    radius === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary/50"
                  }`}
                  title={r}
                >
                  {r.replace("rem", "")}
                </button>
              ))}
            </div>
          </AdminCard>

          {/* Maintenance Settings */}
          {commonData && (
            <AdminCard>
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground font-['Sora']">
                  Maintenance Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Maintenance Time Inputs (Set before enabling) */}
                {commonData.site.mode !== "maintenance" && (
                  <div className="p-4 border border-border/50 rounded-lg space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Set Estimation (Before Enabling)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <AdminInput
                        label="Estimation Hours"
                        type="number"
                        min={0}
                        max={99}
                        value={maintenanceHours}
                        onChange={(e) => setMaintenanceHours(e.target.value ? parseInt(e.target.value) : "")}
                        placeholder="0"
                      />
                      <AdminInput
                        label="Estimation Minutes"
                        type="number"
                        min={0}
                        max={59}
                        value={maintenanceMinutes}
                        onChange={(e) => setMaintenanceMinutes(e.target.value ? parseInt(e.target.value) : "")}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Maintenance Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Power
                      className={`w-5 h-5 ${
                        commonData.site.mode === "maintenance"
                          ? "text-warning"
                          : "text-success"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        Maintenance Mode
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {commonData.site.mode === "maintenance"
                          ? "Site is currently in maintenance mode"
                          : "Site is live and accessible"}
                      </p>
                    </div>
                  </div>
                  <AdminToggle
                    checked={commonData.site.mode === "maintenance"}
                    onChange={(e) => handleToggleMaintenance(e.target.checked)}
                    disabled={maintenanceToggling}
                    />
                </div>

                {/* Estimated Time */}
                {commonData.site.mode === "maintenance" &&
                  commonData.site.estimated_time && (
                    <div className="p-4 bg-secondary/50 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-primary" />
                        <p className="font-medium text-foreground">
                          Estimated Maintenance Time
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Hours
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={commonData.site.estimated_time
                              .split(":")[0]
                              .trim()}
                            disabled
                            readOnly
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Maintenance hours (read-only)"
                          />
                        </div>
                        <span className="text-2xl text-muted-foreground mt-6">
                          :
                        </span>
                        <div className="flex-1">
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Minutes
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={commonData.site.estimated_time
                              .split(":")[1]
                              ?.trim() || "0"}
                            disabled
                            readOnly
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Maintenance minutes (read-only)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </AdminCard>
          )}

          {/* All Theme Palettes */}
          {sortedPalettes.length > 0 && (
            <AdminCard>
              <h2 className="text-lg font-semibold text-foreground font-['Sora'] mb-4">
                All Theme Palettes
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sortedPalettes.map((paletteItem) => (
                  <div
                    key={paletteItem.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      previewingPaletteId === paletteItem.id
                        ? "bg-primary/20 border-2 border-primary"
                        : paletteItem.is_active
                        ? "bg-primary/10 border-2 border-primary/50"
                        : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{paletteItem.name}</p>
                        {paletteItem.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(paletteItem.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewingPaletteId === paletteItem.id ? (
                        <>
                          <button
                            onClick={handleCancelPreview}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                            title="Cancel preview"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleActivatePalette(paletteItem)}
                            disabled={activatingPalette === paletteItem.id || paletteItem.is_active}
                            className="p-1.5 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={paletteItem.is_active ? "Already active" : "Activate palette"}
                          >
                            {activatingPalette === paletteItem.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handlePreviewPalette(paletteItem)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Preview palette"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleActivatePalette(paletteItem)}
                            disabled={activatingPalette === paletteItem.id || paletteItem.is_active}
                            className={`p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              paletteItem.is_active
                                ? "text-primary cursor-default"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                            title={paletteItem.is_active ? "Already active" : "Activate palette"}
                          >
                            {activatingPalette === paletteItem.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}
        </div>

        {/* Live Preview */}
        <AdminCard>
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-['Sora']">
              Live Preview
            </h2>
          </div>

          <div
            className="p-6 border-2 border-dashed border-border rounded-lg"
            style={{
              backgroundColor: `hsl(${previewColors.background})`,
              "--preview-radius": radius,
            } as React.CSSProperties}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-6">
              <div
                className="text-lg font-bold"
                style={{ color: `hsl(${previewColors.foreground})` }}
              >
                {themeName || "Theme Name"}
              </div>
              <div
                className="px-3 py-1 text-sm rounded-full"
                style={{
                  backgroundColor: `hsl(${previewColors.primary})`,
                  color: `hsl(${previewColors.background})`,
                  borderRadius: radius,
                }}
              >
                Badge
              </div>
            </div>

            {/* Preview Card */}
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: `hsl(${previewColors.secondary})`,
                borderRadius: radius,
                border: `1px solid hsl(${previewColors.border})`,
              }}
            >
              <h3
                className="font-medium mb-2"
                style={{ color: `hsl(${previewColors.foreground})` }}
              >
                Sample Card
              </h3>
              <p
                className="text-sm break-words"
                style={{ color: `hsl(${previewColors.muted})` }}
              >
                This is how your cards will look with the current theme settings.
              </p>
            </div>

            {/* Preview Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `hsl(${previewColors.primary})`,
                  color: `hsl(${previewColors.background})`,
                  borderRadius: radius,
                }}
              >
                Primary
              </button>
              <button
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `hsl(${previewColors.secondary})`,
                  color: `hsl(${previewColors.foreground})`,
                  borderRadius: radius,
                }}
              >
                Secondary
              </button>
              <button
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `hsl(${previewColors.accent})`,
                  color: `hsl(${previewColors.foreground})`,
                  borderRadius: radius,
                }}
              >
                Accent
              </button>
            </div>

            {/* Preview Input */}
            <div className="mt-4">
              <label className="sr-only">Sample input field</label>
              <input
                type="text"
                placeholder="Sample input field"
                aria-label="Sample input field"
                className="w-full px-3 py-2 text-sm"
                style={{
                  backgroundColor: `hsl(${previewColors.background})`,
                  color: `hsl(${previewColors.foreground})`,
                  borderRadius: radius,
                  border: `1px solid hsl(${previewColors.border})`,
                }}
              />
            </div>
          </div>

          {/* CSS Variables Preview */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              CSS Variables Preview:
            </p>
            <pre className="text-xs text-foreground font-mono overflow-x-auto">
              {`:root {
${paletteEntries
  .map(([key, value]) => `  ${key}: ${value.startsWith("hsl(") ? value : `hsl(${value})`};`)
  .join("\n")}
}`}
            </pre>
          </div>
        </AdminCard>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saveMessage && (
          <div className="flex items-center gap-2 text-success animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{saveMessage}</span>
          </div>
        )}
        <AdminButton onClick={handleSave} loading={saving} disabled={saving}>
          <Save className="w-4 h-4" />
          Save Theme
        </AdminButton>
      </div>
    </div>
  );
};

export default AdminThemeSettings;
