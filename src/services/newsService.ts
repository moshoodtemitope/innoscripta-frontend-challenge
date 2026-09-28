import type { FetchArticlesParams, FetchArticlesResult, Article } from '../domain/article';
import { AdapterRegistry } from './providers';

export class NewsService {
  static async fetchAggregatedArticles(params: FetchArticlesParams): Promise<FetchArticlesResult> {
    const activeAdapters = AdapterRegistry.getActiveAdapters(params.sources);

    if (activeAdapters.length === 0) {
      return {
        articles: [],
        totalResults: 0,
        page: params.page,
        totalPages: 1
      };
    }

    const results = await Promise.allSettled(
      activeAdapters.map(adapter => adapter.fetchArticles(params))
    );

    let allArticles: Article[] = [];
    let combinedTotalResults = 0;

    results.forEach(res => {
      if (res.status === 'fulfilled') {
        allArticles = allArticles.concat(res.value.articles);
        combinedTotalResults += res.value.totalResults;
      }
    });

    const deduplicated = this.deduplicateArticles(allArticles);
    const sorted = deduplicated.sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const totalCount = (params.authors && params.authors.length > 0)
      ? sorted.length
      : combinedTotalResults;
    const totalPages = Math.max(1, Math.ceil(totalCount / params.pageSize));

    return {
      articles: sorted,
      totalResults: totalCount,
      page: params.page,
      totalPages
    };
  }

  private static deduplicateArticles(articles: Article[]): Article[] {
    const seenTitles = new Set<string>();
    const unique: Article[] = [];

    for (const article of articles) {
      const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        unique.push(article);
      }
    }

    return unique;
  }
}
