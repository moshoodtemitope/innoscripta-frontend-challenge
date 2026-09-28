export type ProviderId = 'bbc' | 'guardian' | 'nyt' | 'newsapi';

export type ArticleCategory = 
  | 'general'
  | 'business'
  | 'technology'
  | 'sports'
  | 'entertainment'
  | 'health'
  | 'science';

export interface ArticleSource {
  id: ProviderId;
  name: string;
  logoUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  source: ArticleSource;
  author: string;
  category: ArticleCategory;
}

export interface FetchArticlesParams {
  query?: string;
  categories?: ArticleCategory[];
  sources?: ProviderId[];
  authors?: string[];
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface FetchArticlesResult {
  articles: Article[];
  totalResults: number;
  page: number;
  totalPages: number;
}

export interface UserPreferences {
  preferredSources: ProviderId[];
  preferredCategories: ArticleCategory[];
  preferredAuthors: string[];
}
