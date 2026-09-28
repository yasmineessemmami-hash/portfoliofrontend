export interface AboutHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface AboutStat {
  /**
   * Icon key used to map to a lucide/react icon on the frontend.
   */
  key: string;
  /**
   * Display value, e.g. "15+", "500+", "100%".
   */
  value: string;
  label: string;
}

export interface AboutAvatar {
  image: string | null;
  letter: string;
}

export interface AboutAvailability {
  text: string;
  is_active: boolean;
}

export interface AboutIntroduction {
  avatar: AboutAvatar;
  availability: AboutAvailability;
  full_name: string;
  role_title: string;
  paragraphs: string[];
  tech_stack: string[];
}

export interface AboutService {
  title: string;
  description: string;
  features: string[];
}

export interface AboutWorkProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface AboutValue {
  /**
   * Icon key used to map to a lucide/react icon on the frontend.
   */
  key: string;
  title: string;
  description: string;
}

export interface AboutResponse {
  hero: AboutHero;
  stats: AboutStat[];
  introduction: AboutIntroduction;
  services: AboutService[];
  work_process: AboutWorkProcessStep[];
  values: AboutValue[];
}


