import { useEffect, useState } from "react";
import { skillsService } from "@/services/skills.service";
import type { SkillsResponse, ProfileActions } from "@/types/skills.types";
import { useCommon } from "./useCommon";

interface UseSkillsReturn {
  data: SkillsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useSkills = (): UseSkillsReturn => {
  const [data, setData] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: commonData, loading: commonLoading } = useCommon();

  useEffect(() => {
    if (commonLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await skillsService.getSkillsData();
        
        if (res) {
          // Build profile actions from backend response (STRICTLY from skills endpoint as requested)
          // We no longer fall back to commonData socials here
          const profileActions: ProfileActions = {
            cv: {
              label: res.hero?.cv_label || "Download CV",
              file_url: res.hero?.cv_file_url || "/cv.pdf",
              icon_key: "icon-download"
            },
            socials: (res.social_links || []).map((link: any) => ({
              platform: link.platform,
              url: link.url,
              icon_key: link.icon_key || "icon-github"
            }))
          };

          // Map backend response to handle potential icon key name differences
          const mappedData: SkillsResponse = {
            hero: res.hero || { title: "", subtitle: "" },
            profile_actions: profileActions,
            skill_categories: (res.skill_categories || []).map((cat: any) => ({
              ...cat,
              icon_key: cat.icon_key || cat.key || "icon-award"
            })),
            learning_focus: res.learning_focus || { title: "", description: "", topics: [] }
          };
          setData(mappedData);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch skills page data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [commonData, commonLoading]);

  return { data, loading: loading || commonLoading, error };
};
