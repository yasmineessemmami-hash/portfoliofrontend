import type { Contact, SocialLink } from "@/types/home.types";

export type SiteMode = "normal" | "maintenance";

export interface ThemeData {
  name: string;
  key: string;
  is_active: boolean;
}

export interface ThemePaletteData {
  name: string;
  palette: Record<string, string>; // CSS variable name -> HSL value
  is_active: boolean;
}

export interface SiteConfigurationsResponse {
  site_configurations: {
    site_mode: SiteMode;
    maintenance_hours: number | null;
    maintenance_minutes: number | null;
    maintenance_until: string | null;
    version: string | null;
    themes: {
      theme: ThemeData | null;
      theme_palette: ThemePaletteData | null;
    };
  };
  personal_information: {
    full_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    social_links: Array<{
      id: number;
      platform: string;
      url: string;
      icon_key: string;
      sort_order: number;
    }>;
  };
}

// Legacy interface for backward compatibility
export interface SiteInfo {
  mode: SiteMode;
  estimated_date: string | null;
  estimated_time?: string | null;
  maintenance_until?: string | null;
  theme: string;
}

// Combined response from /api/v1/site/configurations
export interface CommonResponse {
  site: SiteInfo;
  full_name: string;
  contact: Contact;
  social_links: SocialLink[];
  // Theme data extracted from site_configurations
  seasonalTheme?: string | null;
}


