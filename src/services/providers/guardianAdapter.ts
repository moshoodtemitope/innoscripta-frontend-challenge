import { BaseAdapter } from './baseAdapter';
import { API_URLS } from '../apiUrls';
import type { 
  Article, 
  FetchArticlesParams, 
  FetchArticlesResult, 
  ProviderId 
} from '../../domain/article';

interface GuardianResultItem {
  id: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  fields?: {
    thumbnail?: string;
    byline?: string;
    trailText?: string;
  };
}

interface GuardianApiResponse {
  response: {
    status: string;
    total: number;
    currentPage: number;
    pages: number;
    results: GuardianResultItem[];
  };
}

export class GuardianAdapter extends BaseAdapter {
  readonly id: ProviderId = 'guardian';
  readonly name = 'The Guardian';

  async fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult> {
    try {
      const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY;
      if (!apiKey) {
        return { articles: [], totalResults: 0, page: params.page || 1, totalPages: 1 };
      }

      const pageSize = Math.min(50, Math.max(1, params.pageSize || 10));
      const queryParams = new URLSearchParams({
        'api-key': apiKey,
        'page': String(params.page || 1),
        'page-size': String(pageSize),
        'show-fields': 'thumbnail,byline,trailText'
      });

      if (params.query) queryParams.set('q', params.query);
      if (params.startDate) queryParams.set('from-date', params.startDate);
      if (params.endDate) queryParams.set('to-date', params.endDate);
      if (params.categories?.length) {
        queryParams.set('section', this.mapCategoryToSection(params.categories[0]));
      }

      const response = await fetch(`${API_URLS.guardian.search}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Guardian API error: ${response.statusText}`);
      }

      const data: GuardianApiResponse = await response.json();
      const results = data.response?.results || [];

      let articles: Article[] = results.map(item => ({
        id: `guardian-${item.id}`,
        title: item.webTitle,
        summary: this.stripHtml(item.fields?.trailText || item.webTitle),
        url: item.webUrl,
        imageUrl: item.fields?.thumbnail,
        publishedAt: item.webPublicationDate,
        source: { id: 'guardian', name: 'The Guardian' },
        author: item.fields?.byline || 'The Guardian',
        category: this.normalizeCategory(item.sectionId || item.sectionName)
      }));

      articles = this.filterByAuthor(articles, params.authors);

      return {
        articles,
        totalResults: data.response?.total || articles.length,
        page: data.response?.currentPage || params.page || 1,
        totalPages: data.response?.pages || 1
      };
    } catch (error) {
      return {
        articles: [],
        totalResults: 0,
        page: params.page || 1,
        totalPages: 1
      };
    }
  }

  private mapCategoryToSection(category: string): string {
    switch (category) {
      case 'technology': return 'technology';
      case 'business': return 'business';
      case 'sports': return 'sport';
      case 'entertainment': return 'culture';
      case 'health': return 'society';
      case 'science': return 'environment';
      default: return 'world';
    }
  }
}
