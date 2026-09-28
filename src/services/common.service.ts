import apiClient from "@/services/api";
import type { CommonResponse, SiteConfigurationsResponse } from "@/types/common.types";

export interface UpdateFullNameResponse {
  success: boolean;
  message: string;
  data: {
    full_name: string;
  };
}

export interface UpdateContactInformationResponse {
  success: boolean;
  message: string;
  data: {
    contact_email: string | null;
    contact_phone: string | null;
  };
}

export interface SocialLinkItem {
  id: number;
  platform: string;
  url: string;
  icon_key: string;
  sort_order?: number;
}

export interface SocialLinkResponse {
  success: boolean;
  message: string;
  data: SocialLinkItem | SocialLinkItem[] | null;
}

export interface ValidationErrorResponse {
  message: string;
  errors?: {
    full_name?: string[];
    contact_email?: string[];
    contact_phone?: string[];
    platform?: string[];
    url?: string[];
    icon_key?: string[];
    id?: string[];
    ids?: string[];
  };
}

export interface SiteConfigurationsApiResponse {
  success: boolean;
  message: string;
  data: SiteConfigurationsResponse | null;
}

export const commonService = {
  /**
   * Fetch site configurations (includes common data and theme)
   * POST /api/v1/site/configurations
   */
  getSiteConfigurations: async (): Promise<SiteConfigurationsResponse | null> => {
    const response = await apiClient.post<SiteConfigurationsApiResponse>("/site/configurations");
    return response.data.data;
  },

  /**
   * Fetch common site data (legacy - converts from site configurations)
   * @deprecated Use getSiteConfigurations instead
   */
  getCommonData: async (): Promise<CommonResponse> => {
    const siteConfig = await commonService.getSiteConfigurations();
    
    // If null (empty database), return minimal structure
    if (!siteConfig) {
      return {
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
      };
    }

    // Convert to legacy CommonResponse format
    const estimatedTime = siteConfig.site_configurations.maintenance_hours !== null && 
                         siteConfig.site_configurations.maintenance_minutes !== null
      ? `${String(siteConfig.site_configurations.maintenance_hours).padStart(2, '0')}:${String(siteConfig.site_configurations.maintenance_minutes).padStart(2, '0')}`
      : null;

    return {
      site: {
        mode: siteConfig.site_configurations.site_mode,
        estimated_date: null,
        estimated_time: estimatedTime,
        theme: siteConfig.site_configurations.themes.theme?.key || "normal",
      },
      full_name: siteConfig.personal_information.full_name || "",
      contact: {
        email: siteConfig.personal_information.contact_email || "",
        phone: siteConfig.personal_information.contact_phone || "",
      },
      social_links: siteConfig.personal_information.social_links.map(link => ({
        id: link.id,
        platform: link.platform,
        url: link.url,
        icon_key: link.icon_key,
        sort_order: link.sort_order,
      })),
      seasonalTheme: siteConfig.site_configurations.themes.theme?.key || null,
    };
  },

  /**
   * Update full name
   * POST /api/v1/site/configurations/update/full-name
   */
  updateFullName: async (fullName: string): Promise<UpdateFullNameResponse> => {
    const response = await apiClient.post<UpdateFullNameResponse>(
      "/site/configurations/update/full-name",
      { full_name: fullName }
    );
    return response.data;
  },

  /**
   * Update contact information
   * POST /api/v1/site/configurations/update/contact-information
   */
  updateContactInformation: async (
    contactEmail: string,
    contactPhone: string
  ): Promise<UpdateContactInformationResponse> => {
    const response = await apiClient.post<UpdateContactInformationResponse>(
      "/site/configurations/update/contact-information",
      {
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
      }
    );
    return response.data;
  },

  /**
   * Add social link
   * POST /api/v1/site/configurations/add/social-links
   */
  addSocialLink: async (
    platform: string,
    url: string,
    iconKey: string,
    sortOrder: number
  ): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/add/social-links",
      {
        platform,
        url,
        icon_key: iconKey,
        sort_order: sortOrder,
      }
    );
    return response.data;
  },

  /**
   * Update social link
   * POST /api/v1/site/configurations/update/social-links
   */
  updateSocialLink: async (
    id: number,
    platform: string,
    url: string,
    iconKey: string
  ): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/update/social-links",
      {
        id,
        platform,
        url,
        icon_key: iconKey,
      }
    );
    return response.data;
  },

  /**
   * Delete social link
   * DELETE /api/v1/site/configurations/delete/social-links
   */
  deleteSocialLink: async (id: number): Promise<SocialLinkResponse> => {
    const response = await apiClient.delete<SocialLinkResponse>(
      "/site/configurations/delete/social-links",
      { data: { id } }
    );
    return response.data;
  },

  /**
   * Reorder social links
   * POST /api/v1/site/configurations/order/social-links
   */
  reorderSocialLinks: async (ids: number[]): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/order/social-links",
      { ids }
    );
    return response.data;
  },

  /**
   * Get all themes and theme palettes
   * POST /api/v1/site/configurations/get/themes
   */
  getThemes: async (): Promise<{
    themes: Array<{
      id: number;
      name: string;
      key: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
    theme_palettes: Array<{
      id: number;
      name: string;
      palette: Record<string, string>;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
  }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        themes: Array<{
          id: number;
          name: string;
          key: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
        theme_palettes: Array<{
          id: number;
          name: string;
          palette: Record<string, string>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
      };
    }>("/site/configurations/get/themes");
    return response.data.data;
  },

  /**
   * Update theme palette
   * POST /api/v1/site/configurations/theme-palette/update
   */
  updateThemePalette: async (
    name: string,
    palette: Record<string, string>
  ): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/theme-palette/update",
      { name, palette }
    );
    return response.data;
  },

  /**
   * Reset theme palette to default
   * POST /api/v1/site/configurations/theme-palette/reset
   */
  resetThemePalette: async (): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/theme-palette/reset"
    );
    return response.data;
  },

  /**
   * Restore default theme palette
   * POST /api/v1/site/configurations/theme-palette/restore-default
   */
  restoreDefaultThemePalette: async (): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/theme-palette/restore-default"
    );
    return response.data;
  },

  /**
   * Create new theme palette
   * POST /api/v1/site/configurations/theme-palette/create
   */
  createNewThemePalette: async (
    name: string,
    palette: Record<string, string>
  ): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/theme-palette/create",
      { name, palette }
    );
    return response.data;
  },

  /**
   * Toggle event theme
   * POST /api/v1/site/configurations/event-theme/toggle
   */
  toggleEventTheme: async (themeKey: string): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/event-theme/toggle",
      { theme_key: themeKey }
    );
    return response.data;
  },

  /**
   * Toggle maintenance mode
   * POST /api/v1/site/configurations/maintenance-mode/toggle
   */
  toggleMaintenanceMode: async (
    siteMode: "normal" | "maintenance",
    hours?: number | null,
    minutes?: number | null
  ): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/maintenance-mode/toggle",
      { 
        site_mode: siteMode,
        maintenance_hours: hours,
        maintenance_minutes: minutes
      }
    );
    return response.data;
  },

  /**
   * Activate theme palette by ID
   * POST /api/v1/site/configurations/theme-palette/activate
   */
  activateThemePalette: async (paletteId: number): Promise<SocialLinkResponse> => {
    const response = await apiClient.post<SocialLinkResponse>(
      "/site/configurations/theme-palette/activate",
      { palette_id: paletteId }
    );
    return response.data;
  },
};
