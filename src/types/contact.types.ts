export interface ContactHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface ContactInfoItem {
  key: string;
  icon_key?: string;
  label: string;
  value: string;
  href: string | null;
  type: "link" | "text";
}

export interface SocialLink {
  key: string;
  icon_key?: string;
  label: string;
  url: string;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
}

export interface ContactForm {
  fields: FormField[];
}

export interface ContactResponse {
  hero: ContactHero;
  contact_info: ContactInfoItem[];
  social_links: SocialLink[];
  form: ContactForm;
}
