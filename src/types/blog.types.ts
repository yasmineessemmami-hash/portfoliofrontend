export interface BlogHero {
  title: string;
  subtitle: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // Frontend uses 'date', backend may send 'published_at'
  read_time: string;
  tags: string[];
  image: string;
  media_type?: 'image' | 'emoji' | 'icon';
}

// Backend response format for blog posts
export interface BlogPostBackend {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at?: string; // Backend sends this
  date?: string; // Some backends may send this
  read_time: string;
  tags: string[];
  image: string;
}

export interface BlogResponse {
  hero: BlogHero;
  author?: any;
  posts: any[];
}

export interface BlogListResponse {
  hero: BlogHero;
  posts: BlogPost[];
}

export interface ArticleContent {
  title: string;
  excerpt: string;
  date: string; // Frontend uses 'date', backend may send 'published_at'
  read_time: string;
  tags: string[];
  image: string;
  media_type?: 'image' | 'emoji' | 'icon';
  media_value?: string;
  content: string[];
}

export interface ArticleResponse {
  article: ArticleContent;
}

// Backend response format (article object directly, not wrapped)
export interface ArticleBackend {
  title: string;
  excerpt: string;
  published_at?: string; // Backend sends this
  date?: string; // Some backends may send this
  read_time: string;
  tags: string[];
  image: string;
  content: string[];
}

export interface AuthorAvatar {
  image_url: string;
  alt: string;
}

export interface AuthorSocialLink {
  platform: string;
  url: string;
  icon_key: string;
}

export interface AuthorInfo {
  full_name: string;
  role: string;
  bio: string;
  avatar: AuthorAvatar;
  social_links: AuthorSocialLink[];
}

export interface AuthorResponse {
  author: AuthorInfo;
}
