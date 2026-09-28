export interface MetaLanguage {
  title: string;
  description: string;
  keywords: string[];
}

export interface MetaResponse {
  meta: {
    en: MetaLanguage;
    ar: MetaLanguage;
  };
}
