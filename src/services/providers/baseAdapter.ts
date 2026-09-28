import type {
  Article,
  ArticleCategory,
  FetchArticlesParams,
  FetchArticlesResult,
  ProviderId
} from '@/domain/article';

export interface INewsAdapter {
  readonly id: ProviderId;
  readonly name: string;
  fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult>;
}

export abstract class BaseAdapter implements INewsAdapter {
  abstract readonly id: ProviderId;
  abstract readonly name: string;

  abstract fetchArticles(params: FetchArticlesParams): Promise<FetchArticlesResult>;

  protected stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  protected normalizeCategory(rawCategory?: string): ArticleCategory {
    if (!rawCategory) return 'general';
    const categoryText = rawCategory.toLowerCase();

    if (categoryText.includes('tech')) return 'technology';
    if (categoryText.includes('busin') || categoryText.includes('econ') || categoryText.includes('financ')) return 'business';
    if (categoryText.includes('sport')) return 'sports';
    if (categoryText.includes('art') || categoryText.includes('cultur') || categoryText.includes('entertainment') || categoryText.includes('movie')) return 'entertainment';
    if (categoryText.includes('health') || categoryText.includes('med')) return 'health';
    if (categoryText.includes('sci') || categoryText.includes('envir') || categoryText.includes('nature') || categoryText.includes('earth')) return 'science';

    return 'general';
  }

  protected filterByAuthor(articles: Article[], preferredAuthors?: string[]): Article[] {
    if (!preferredAuthors || preferredAuthors.length === 0) return articles;
    const searchAuthors = preferredAuthors.map(a => a.toLowerCase().trim()).filter(Boolean);
    if (searchAuthors.length === 0) return articles;

    return articles.filter(article => {
      const authorLower = article.author.toLowerCase();
      return searchAuthors.some(searchAuth => authorLower.includes(searchAuth));
    });
  }
}
