import type { Article, FetchArticlesResult } from '@/domain/article';

export function extractUniqueAuthors(
  articles: Article[] = [],
  cachedQueries: Array<[unknown, FetchArticlesResult | undefined]> = [],
  preferredAuthors: string[] = []
): string[] {
  const authorSet = new Set<string>();

  const baseBylines = ['BBC News', 'The Guardian', 'The New York Times', 'NewsAPI.org'];
  baseBylines.forEach(name => authorSet.add(name));

  preferredAuthors.forEach(author => {
    if (author && author.trim()) {
      authorSet.add(author.trim());
    }
  });

  articles.forEach(article => {
    if (article.author && article.author.trim() && article.author !== 'Unknown') {
      const cleaned = article.author.replace(/^by\s+/i, '').trim();
      if (cleaned) {
        authorSet.add(cleaned);
      }
    }
  });

  cachedQueries.forEach(([, result]) => {
    result?.articles?.forEach(article => {
      if (article.author && article.author.trim() && article.author !== 'Unknown') {
        const cleaned = article.author.replace(/^by\s+/i, '').trim();
        if (cleaned) {
          authorSet.add(cleaned);
        }
      }
    });
  });

  return Array.from(authorSet).sort((a, b) => a.localeCompare(b));
}
