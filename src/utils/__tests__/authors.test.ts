import { describe, it, expect } from 'vitest';
import { extractUniqueAuthors } from '../authors';
import type { Article } from '@/domain/article';

describe('extractUniqueAuthors utility', () => {
  it('should extract unique cleaned authors from articles and preferences', () => {
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'Article 1',
        summary: 'Summary 1',
        url: 'https://example.com/1',
        source: { id: 'guardian', name: 'The Guardian' },
        author: 'By Dan Sabbagh',
        category: 'general'
      },
      {
        id: '2',
        title: 'Article 2',
        summary: 'Summary 2',
        url: 'https://example.com/2',
        source: { id: 'nyt', name: 'The New York Times' },
        author: 'Maggie Haberman',
        category: 'business'
      },
      {
        id: '3',
        title: 'Article 3',
        summary: 'Summary 3',
        url: 'https://example.com/3',
        source: { id: 'bbc', name: 'BBC News' },
        author: 'By Dan Sabbagh',
        category: 'technology'
      }
    ];

    const authors = extractUniqueAuthors(mockArticles, [], ['Richard Sandomir']);

    expect(authors).toContain('Dan Sabbagh');
    expect(authors).toContain('Maggie Haberman');
    expect(authors).toContain('Richard Sandomir');
    expect(authors).toContain('BBC News');
    expect(authors.filter(a => a === 'Dan Sabbagh')).toHaveLength(1);
  });
});
