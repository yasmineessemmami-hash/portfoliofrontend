export interface ServicesHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface ServiceItem {
  id?: number;
  icon_key: string;
  title: string;
  description: string;
  features: string[];
  color?: string;
  sort_order?: number;
}

export interface WhyChooseMeItem {
  id?: number;
  icon_key: string;
  title: string;
  description: string;
  sort_order?: number;
}

export interface DeliverableItem {
  id?: number;
  icon_key: string;
  title: string;
  description: string;
  sort_order?: number;
}

export interface ServicesResponse {
  hero: ServicesHero;
  services: ServiceItem[];
  why_choose_me: WhyChooseMeItem[];
  deliverables: DeliverableItem[];
}
