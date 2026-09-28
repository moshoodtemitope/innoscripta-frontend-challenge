import { BaseAdapter } from './baseAdapter';
import { API_URLS } from '../apiUrls';
import type { 
  Article, 
  FetchArticlesParams, 
  FetchArticlesResult, 
  ProviderId 
} from '../../domain/article';

interface NewsApiArticleItem {
  source?: { id?: string; name?: string };
  author?: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticleItem[];
  message?: string;
}

export class NewsApiAdapter extends BaseAdapter {
  readonly id: ProviderId = 'newsapi';
  readonly name = 'NewsAPI.org';

  async fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult> {
    try {
      const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
      if (!apiKey) {
        return { articles: [], totalResults: 0, page: params.page || 1, totalPages: 1 };
      }

      const endpoint = (params.query && !params.categories?.length) 
        ? API_URLS.newsapi.everything 
        : API_URLS.newsapi.topHeadlines;

      const queryParams = new URLSearchParams({
        'apiKey': apiKey,
        'page': String(params.page || 1),
        'pageSize': String(params.pageSize || 10)
      });

      if (params.query) queryParams.set('q', params.query);
      if (params.categories?.length) queryParams.set('category', params.categories[0]);
      if (!params.query && !params.categories?.length) queryParams.set('country', 'us');

      const response = await fetch(`${endpoint}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data: NewsApiResponse = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.articles)) {
        throw new Error(data.message || 'NewsAPI payload error');
      }

      let articles: Article[] = data.articles.map((item, index) => ({
        id: `newsapi-${item.source?.id || 'src'}-${index}`,
        title: item.title,
        summary: item.description || item.title,
        content: item.content,
        url: item.url,
        imageUrl: item.urlToImage,
        publishedAt: item.publishedAt,
        source: { id: 'newsapi', name: item.source?.name || 'NewsAPI.org' },
        author: item.author || item.source?.name || 'NewsAPI.org',
        category: params.categories?.[0] || 'general'
      }));

      articles = this.filterByAuthor(articles, params.authors);
      const pageSize = params.pageSize || 10;

      return {
        articles,
        totalResults: data.totalResults,
        page: params.page || 1,
        totalPages: Math.max(1, Math.ceil(data.totalResults / pageSize))
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
}
