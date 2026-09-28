export interface FAQHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface FAQResponse {
  hero: FAQHero;
  items: FAQItem[];
  faqs?: FAQItem[]; // Legacy field name for backward compatibility
}
