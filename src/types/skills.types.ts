export interface SkillsHero {
  title: string;
  subtitle: string;
  description?: string;
  cv_label: string;
  cv_file_url?: string | null;
}

export interface ProfileActionCV {
  label: string;
  file_url: string;
  icon_key: string;
}

export interface ProfileActionSocial {
  id?: number;
  platform: string;
  url: string;
  icon_key: string;
  sort_order?: number;
}

export interface ProfileActions {
  cv: ProfileActionCV;
  socials: ProfileActionSocial[];
}

export interface SkillCategory {
  id?: number;
  key: string;
  title: string;
  description: string;
  icon_key: string;
  skills: string[];
}

export interface LearningFocus {
  title: string;
  description: string;
  topics: string[];
}

export interface SkillsResponse {
  hero: SkillsHero;
  skill_categories: SkillCategory[];
  learning_focus: LearningFocus;
  social_links?: ProfileActionSocial[];
  profile_actions?: ProfileActions;
}
