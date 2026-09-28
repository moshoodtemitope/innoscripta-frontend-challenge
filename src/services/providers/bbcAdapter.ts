import { BaseAdapter } from './baseAdapter';
import { API_URLS } from '../apiUrls';
import type {
  Article,
  FetchArticlesParams,
  FetchArticlesResult,
  ProviderId
} from '@/domain/article';

interface BbcArticleItem {
  title: string;
  summary: string;
  image_link: string;
  news_link: string;
}

type BbcApiResponse = Record<string, BbcArticleItem[] | string | number>;

export class BbcAdapter extends BaseAdapter {
  readonly id: ProviderId = 'bbc';
  readonly name = 'BBC News';

  async fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult> {
    try {
      if (params.startDate || params.endDate) {
        return {
          articles: [],
          totalResults: 0,
          page: params.page || 1,
          totalPages: 1
        };
      }

      const isDev = import.meta.env.DEV;
      const baseUrl = isDev ? '/api-bbc' : 'https://bbc-news-api.vercel.app';
      
      const endpoint = params.categories?.length
        ? `${baseUrl}/latest?lang=english`
        : `${baseUrl}/news?lang=english`;

      let response = await fetch(endpoint).catch(() => null);

      if (!response || !response.ok) {
        const directUrl = params.categories?.length
          ? API_URLS.bbc.latest
          : API_URLS.bbc.news;
        response = await fetch(directUrl);
      }

      if (!response.ok) {
        throw new Error(`BBC API error: ${response.statusText}`);
      }

      const data: BbcApiResponse = await response.json();
      const rawArticles: Article[] = [];

      for (const [key, items] of Object.entries(data)) {
        if (!Array.isArray(items)) continue;

        const category = this.normalizeCategory(key);

        items.forEach((item, index) => {
          if (!item.title || !item.news_link) return;

          rawArticles.push({
            id: `bbc-${encodeURIComponent(item.news_link || String(index))}`,
            title: item.title,
            summary: item.summary || item.title,
            url: item.news_link,
            imageUrl: item.image_link || undefined,
            publishedAt: undefined,
            source: { id: 'bbc', name: 'BBC News' },
            author: 'BBC News',
            category
          });
        });
      }

      let filteredNews = rawArticles;

      if (params.query) {
        const queryLower = params.query.toLowerCase();
        filteredNews = filteredNews.filter(a =>
          a.title.toLowerCase().includes(queryLower) ||
          a.summary.toLowerCase().includes(queryLower)
        );
      }

      if (params.categories?.length) {
        filteredNews = filteredNews.filter(a => params.categories?.includes(a.category));
      }

      filteredNews = this.filterByAuthor(filteredNews, params.authors);

      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const totalResults = filteredNews.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedArticles = filteredNews.slice(startIndex, startIndex + pageSize);

      return {
        articles: paginatedArticles,
        totalResults,
        page,
        totalPages: Math.max(1, Math.ceil(totalResults / pageSize))
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
