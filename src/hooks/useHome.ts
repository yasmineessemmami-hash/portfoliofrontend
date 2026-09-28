import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { homeService, type HomeFeaturedProjectData } from "@/services/home.service";
import type { HomeResponse, Hero, FeaturedProject } from "@/types/home.types";
import { useCommon } from "./useCommon";
import { useIntroContext } from "@/context/IntroContext";

interface UseHomeReturn {
  data: HomeResponse | null;
  loading: boolean;
  error: string | null;
}

export const useHome = (): UseHomeReturn => {
  const [data, setData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState<boolean>(false);
  const location = useLocation();
  const { introCompleted } = useIntroContext();
  const { data: commonData, loading: commonLoading } = useCommon();

  const isHomeRoute = location.pathname === "/";

  useEffect(() => {
    // Reset when navigating away from home
    if (!isHomeRoute) {
      setData(null);
      setError(null);
      setLoading(false);
      setHasAttemptedFetch(false);
      return;
    }

    // Wait for intro to complete and common data to be ready
    if (!introCompleted || !commonData || commonLoading) {
      return;
    }

    // Abort controller to cancel in-flight requests if component unmounts or route changes
    const abortController = new AbortController();

    const fetchData = async () => {
      setHasAttemptedFetch(true);
      setLoading(true);
      setError(null);

      try {
        const homeDataResponse = await homeService.getHomeData();

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (!homeDataResponse) {
          setError("No home page data found.");
          setLoading(false);
          return;
        }

        // Map backend response to frontend format
        const hero: Hero | null = homeDataResponse.home_hero
          ? {
              status_badge: {
                text: homeDataResponse.home_hero.status_text || "",
                is_active: homeDataResponse.home_hero.status_active ?? false,
              },
              full_name: homeDataResponse.home_hero.full_name || "",
              role_title: homeDataResponse.home_hero.role_title || "",
              headline: homeDataResponse.home_hero.headline || "",
              subheadline: homeDataResponse.home_hero.subheadline || "",
            }
          : null;

        if (!hero) {
          setError("Hero section data is missing.");
          setLoading(false);
          return;
        }

        const featuredProjects: FeaturedProject[] = (homeDataResponse.home_featured_projects || []).map(
          (project: HomeFeaturedProjectData): FeaturedProject => ({
            id: project.id || 0,
            title: project.title || "",
            description: project.description || "",
            tech_stack: project.tech ? project.tech.split(",").map((t) => t.trim()).filter(Boolean) : [],
            image: project.image || "",
            image_type: project.image_type === "icon" ? "key" : (project.image_type as "emoji" | "url" | "svg"),
            key: project.icon_key || undefined,
          })
        );

        const homeResponse: HomeResponse = {
          hero,
          contact: commonData?.contact || { email: "", phone: "" },
          social_links: commonData?.social_links || [],
          featured_projects: featuredProjects,
        };

        // Check if request was aborted before setting state
        if (!abortController.signal.aborted) {
          setData(homeResponse);
        }
      } catch (err) {
        // Only set error if request wasn't aborted
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to fetch home data");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: abort request if component unmounts or route changes
    return () => {
      abortController.abort();
    };
  }, [isHomeRoute, introCompleted, commonData, commonLoading]);

  // Combined loading state: show loading if intro is done AND (waiting for common data OR fetching home data OR ready to fetch but haven't started)
  const isPending = isHomeRoute && introCompleted && (
    commonLoading || 
    !commonData || 
    loading || 
    (!hasAttemptedFetch && !data && !error)
  );

  return { 
    data, 
    loading: isPending,
    error: error
  };
};
