export interface ProjectsHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  image: string;
  image_type: 'url' | 'key' | 'emoji' | 'svg';
  key?: string; // for icons if used as image
  github_url?: string | null;
  live_url?: string | null;
  contact_email?: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface ProjectsResponse {
  hero: ProjectsHero;
  projects: ProjectItem[];
}
