import type { ProviderId, ArticleCategory } from '../domain/article';

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  brandColor: string;
  description: string;
  requiresKey: boolean;
  envKeyName?: string;
  enabledByDefault: boolean;
}

export const PROVIDERS_CONFIG: Record<ProviderId, ProviderInfo> = {
  bbc: {
    id: 'bbc',
    name: 'BBC News',
    brandColor: '#bb1919',
    description: 'World leading public service broadcaster feed',
    requiresKey: false,
    enabledByDefault: true
  },
  guardian: {
    id: 'guardian',
    name: 'The Guardian',
    brandColor: '#052962',
    description: 'Independent journalism from Guardian Media Group',
    requiresKey: true,
    envKeyName: 'VITE_GUARDIAN_API_KEY',
    enabledByDefault: true
  },
  nyt: {
    id: 'nyt',
    name: 'New York Times',
    brandColor: '#121212',
    description: 'Premier global newspaper and in-depth reporting',
    requiresKey: true,
    envKeyName: 'VITE_NYT_API_KEY',
    enabledByDefault: true
  },
  newsapi: {
    id: 'newsapi',
    name: 'NewsAPI.org',
    brandColor: '#2b5797',
    description: 'Global news articles from 80,000+ sources',
    requiresKey: true,
    envKeyName: 'VITE_NEWSAPI_KEY',
    enabledByDefault: true
  }
};

export const CATEGORIES_CONFIG: { id: ArticleCategory; label: string }[] = [
  { id: 'general', label: 'General & World' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Arts & Culture' },
  { id: 'health', label: 'Health' },
  { id: 'science', label: 'Science & Nature' }
];
