export interface StatusBadge {
  text: string;
  is_active: boolean;
}

export interface Hero {
  status_badge: StatusBadge;
  full_name: string;
  role_title: string;
  headline: string;
  subheadline: string;
}

export interface Contact {
  email: string;
  phone: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  id?: number;
  icon_key?: string;
  sort_order?: number;
}

export type ImageType = "emoji" | "url" | "svg" | "key";

export interface FeaturedProject {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  image: string;
  image_type: ImageType;
  /**
   * Optional icon key provided by backend when image_type === "key"
   */
  key?: string;
}

export interface HomeResponse {
  hero: Hero;
  contact: Contact;
  social_links: SocialLink[];
  featured_projects: FeaturedProject[];
}
