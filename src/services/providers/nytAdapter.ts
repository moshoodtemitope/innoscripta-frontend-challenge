import { BaseAdapter } from './baseAdapter';
import { API_URLS } from '../apiUrls';
import type { 
  Article, 
  FetchArticlesParams, 
  FetchArticlesResult, 
  ProviderId 
} from '@/domain/article';

interface NytSearchDoc {
  _id: string;
  headline?: { main?: string };
  abstract?: string;
  snippet?: string;
  web_url: string;
  pub_date: string;
  byline?: { original?: string };
  section_name?: string;
  multimedia?: {
    default?: { url?: string };
    thumbnail?: { url?: string };
  } | Array<{ url?: string; format?: string }>;
}

interface NytSearchResponse {
  status: string;
  response?: {
    docs: NytSearchDoc[];
    metadata?: { hits: number; offset: number };
  };
}

export class NytAdapter extends BaseAdapter {
  readonly id: ProviderId = 'nyt';
  readonly name = 'New York Times';

  async fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult> {
    try {
      const apiKey = import.meta.env.VITE_NYT_API_KEY;
      if (!apiKey) {
        return { articles: [], totalResults: 0, page: params.page || 1, totalPages: 1 };
      }

      const nytPage = Math.max(0, (params.page || 1) - 1);
      const queryParams = new URLSearchParams({
        'api-key': apiKey,
        'page': String(nytPage)
      });

      if (params.query) queryParams.set('q', params.query);
      if (params.startDate) queryParams.set('begin_date', this.formatNytDate(params.startDate));
      if (params.endDate) queryParams.set('end_date', this.formatNytDate(params.endDate));
      if (params.categories?.length) {
        queryParams.set('fq', `section_name:("${this.mapCategoryToSection(params.categories[0])}")`);
      }

      const response = await fetch(`${API_URLS.nyt.articleSearch}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`NYT API error: ${response.statusText}`);
      }

      const data: NytSearchResponse = await response.json();
      const docs = data.response?.docs || [];

      let articles: Article[] = docs.map(doc => ({
        id: `nyt-${doc._id}`,
        title: doc.headline?.main || 'New York Times Article',
        summary: doc.abstract || doc.snippet || '',
        url: doc.web_url,
        imageUrl: this.extractImageUrl(doc.multimedia),
        publishedAt: doc.pub_date,
        source: { id: 'nyt', name: 'New York Times' },
        author: doc.byline?.original || 'The New York Times',
        category: this.normalizeCategory(doc.section_name)
      }));

      articles = this.filterByAuthor(articles, params.authors);

      const totalHits = data.response?.metadata?.hits || articles.length;
      const pageSize = params.pageSize || 10;

      return {
        articles,
        totalResults: totalHits,
        page: params.page || 1,
        totalPages: Math.max(1, Math.ceil(totalHits / pageSize))
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

  private extractImageUrl(multimedia: NytSearchDoc['multimedia']): string | undefined {
    if (!multimedia) return undefined;

    if (Array.isArray(multimedia)) {
      const imageObj = multimedia.find(m => m.url);
      if (!imageObj?.url) return undefined;
      return imageObj.url.startsWith('http') ? imageObj.url : `${API_URLS.nyt.assetHost}${imageObj.url}`;
    }

    const defaultUrl = multimedia.default?.url || multimedia.thumbnail?.url;
    if (!defaultUrl) return undefined;
    return defaultUrl.startsWith('http') ? defaultUrl : `${API_URLS.nyt.assetHost}${defaultUrl}`;
  }

  private formatNytDate(dateStr: string): string {
    return dateStr.replace(/-/g, '');
  }

  private mapCategoryToSection(category: string): string {
    switch (category) {
      case 'technology': return 'Technology';
      case 'business': return 'Business';
      case 'sports': return 'Sports';
      case 'entertainment': return 'Arts';
      case 'health': return 'Health';
      case 'science': return 'Science';
      default: return 'World';
    }
  }
}
