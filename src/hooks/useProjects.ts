import { useEffect, useState } from "react";
import { projectsService } from "@/services/projects.service";
import type { ProjectsResponse, ProjectItem } from "@/types/projects.types";

interface UseProjectsReturn {
  data: ProjectsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useProjects = (): UseProjectsReturn => {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await projectsService.getProjects();
        
        if (res) {
          // Map backend response to ensure consistent field names
          const mappedData: ProjectsResponse = {
            hero: res.hero || { title: "", subtitle: "" },
            projects: (res.projects || []).map((p: any): ProjectItem => ({
              id: p.id,
              title: p.title || "",
              description: p.description || "",
              tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
              image: p.image || "",
              image_type: p.image_type || "url",
              key: p.key || undefined,
              github_url: p.github_url || null,
              live_url: p.live_url || null,
              contact_email: p.contact_email || null,
              is_featured: !!p.is_featured,
              sort_order: p.sort_order || 0
            }))
          };
          setData(mappedData);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch projects data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
