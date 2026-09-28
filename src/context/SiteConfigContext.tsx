import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { SiteConfigurationsResponse } from "@/types/common.types";
import { commonService } from "@/services/common.service";

export interface ThemesResponse {
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
}

interface SiteConfigContextValue {
  siteConfig: SiteConfigurationsResponse | null;
  themes: ThemesResponse | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<{ siteConfig: SiteConfigurationsResponse | null; themes: ThemesResponse | null }>;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  siteConfig: null,
  themes: null,
  loading: true,
  error: null,
  refresh: async () => ({ siteConfig: null, themes: null }),
});

interface SiteConfigProviderProps {
  children: ReactNode;
}

export const SiteConfigProvider = ({ children }: SiteConfigProviderProps) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfigurationsResponse | null>(null);
  const [themes, setThemes] = useState<ThemesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const fetchSiteConfig = async (options: { silent?: boolean } = {}): Promise<{ siteConfig: SiteConfigurationsResponse | null; themes: ThemesResponse | null }> => {
    try {
      if (!options.silent) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch both site configurations and themes in parallel
      const [config, themesData] = await Promise.all([
        commonService.getSiteConfigurations(),
        commonService.getThemes(),
      ]);
      
      setSiteConfig(config);
      setThemes(themesData);
      setHasFetched(true);
      return { siteConfig: config, themes: themesData };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch site configurations");
      setSiteConfig(null);
      setThemes(null);
      setHasFetched(true);
      return { siteConfig: null, themes: null };
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Only fetch once on mount, never refetch on navigation
    if (!hasFetched) {
      fetchSiteConfig();
    }
  }, [hasFetched]);

  return (
    <SiteConfigContext.Provider value={{ siteConfig, themes, loading, error, refresh: fetchSiteConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfigContext = () => useContext(SiteConfigContext);

