import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BbcAdapter } from '../bbcAdapter';
import { GuardianAdapter } from '../guardianAdapter';
import { NytAdapter } from '../nytAdapter';
import { NewsApiAdapter } from '../newsApiAdapter';
import { NewsService } from '../../newsService';

describe('News Adapters & Aggregator Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('BbcAdapter', () => {
    it('should normalize section titles into standard categories and omit publishedAt', async () => {
      const mockBbcResponse = {
        status: 200,
        Technology: [
          {
            title: 'Tech Headline',
            summary: 'Tech Summary',
            image_link: 'https://example.com/img.jpg',
            news_link: 'https://example.com/news/1'
          }
        ]
      };

      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => ({
        ok: true,
        json: async () => mockBbcResponse
      } as Response));

      const adapter = new BbcAdapter();
      const result = await adapter.fetchArticles({ page: 1, pageSize: 10 });

      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].category).toBe('technology');
      expect(result.articles[0].source.name).toBe('BBC News');
      expect(result.articles[0].publishedAt).toBeUndefined();
    });

    it('should skip BBC articles when date filters are applied', async () => {
      const adapter = new BbcAdapter();
      const result = await adapter.fetchArticles({
        startDate: '2026-09-01',
        endDate: '2026-09-28',
        page: 1,
        pageSize: 10
      });

      expect(result.articles).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });

    it('should handle network errors gracefully without throwing', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        throw new Error('Network failure');
      });

      const adapter = new BbcAdapter();
      const result = await adapter.fetchArticles({ page: 1, pageSize: 10 });

      expect(result.articles).toEqual([]);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('GuardianAdapter', () => {
    it('should map Guardian API fields and correctly clamp page-size', async () => {
      const mockGuardianResponse = {
        response: {
          status: 'ok',
          total: 100,
          currentPage: 1,
          pages: 10,
          results: [
            {
              id: 'sport/2026/sep/28/match-report',
              sectionId: 'sport',
              sectionName: 'Sport',
              webPublicationDate: '2026-09-28T12:00:00Z',
              webTitle: 'Match Report Headline',
              webUrl: 'https://theguardian.com/match',
              fields: {
                thumbnail: 'https://theguardian.com/thumb.jpg',
                byline: 'John Doe',
                trailText: '<p>Exciting summary snippet</p>'
              }
            }
          ]
        }
      };

      vi.stubEnv('VITE_GUARDIAN_API_KEY', 'test-key');
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => ({
        ok: true,
        json: async () => mockGuardianResponse
      } as Response));

      const adapter = new GuardianAdapter();
      const result = await adapter.fetchArticles({ page: 1, pageSize: 100 });

      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('Match Report Headline');
      expect(result.articles[0].summary).toBe('Exciting summary snippet');
      expect(result.articles[0].author).toBe('John Doe');
      expect(result.articles[0].category).toBe('sports');
    });
  });

  describe('NytAdapter', () => {
    it('should convert 1-indexed page to 0-indexed and format date strings', async () => {
      const mockNytResponse = {
        status: 'OK',
        response: {
          docs: [
            {
              _id: 'nyt-123',
              headline: { main: 'NYT Main Headline' },
              abstract: 'NYT Article Abstract',
              web_url: 'https://nytimes.com/123',
              pub_date: '2026-09-28T09:00:00Z',
              section_name: 'Technology',
              byline: { original: 'By Jane Smith' }
            }
          ],
          metadata: { hits: 50, offset: 0 }
        }
      };

      vi.stubEnv('VITE_NYT_API_KEY', 'test-key');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => ({
        ok: true,
        json: async () => mockNytResponse
      } as Response));

      const adapter = new NytAdapter();
      const result = await adapter.fetchArticles({
        page: 2,
        pageSize: 10,
        startDate: '2026-09-01'
      });

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('begin_date=20260901');

      expect(result.articles[0].title).toBe('NYT Main Headline');
      expect(result.articles[0].author).toBe('By Jane Smith');
    });
  });

  describe('NewsApiAdapter', () => {
    it('should handle CORS/API errors gracefully without crashing', async () => {
      vi.stubEnv('VITE_NEWSAPI_KEY', 'test-key');
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => ({
        ok: false,
        statusText: 'Forbidden'
      } as Response));

      const adapter = new NewsApiAdapter();
      const result = await adapter.fetchArticles({ page: 1, pageSize: 10 });

      expect(result.articles).toEqual([]);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('NewsService Aggregator', () => {
    it('should deduplicate articles with identical headlines across providers and sort by date', async () => {
      const mockArticle1 = {
        id: 'nyt-1',
        title: 'Global Tech Breakthrough',
        summary: 'Snippet 1',
        url: 'https://nytimes.com/tech',
        publishedAt: '2026-09-28T10:00:00Z',
        source: { id: 'nyt' as const, name: 'New York Times' },
        author: 'NYT Staff',
        category: 'technology' as const
      };

      const mockArticleDuplicate = {
        id: 'guardian-1',
        title: 'Global Tech Breakthrough!',
        summary: 'Snippet 2',
        url: 'https://theguardian.com/tech',
        publishedAt: '2026-09-28T12:00:00Z',
        source: { id: 'guardian' as const, name: 'The Guardian' },
        author: 'Guardian Staff',
        category: 'technology' as const
      };

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        const urlStr = String(url);
        if (urlStr.includes('nytimes')) {
          return {
            ok: true,
            json: async () => ({
              response: { docs: [{ _id: '1', headline: { main: mockArticle1.title }, pub_date: mockArticle1.publishedAt, web_url: mockArticle1.url }] }
            })
          } as Response;
        }
        if (urlStr.includes('guardian')) {
          return {
            ok: true,
            json: async () => ({
              response: { results: [{ id: '1', webTitle: mockArticleDuplicate.title, webPublicationDate: mockArticleDuplicate.publishedAt, webUrl: mockArticleDuplicate.url }] }
            })
          } as Response;
        }
        return {
          ok: true,
          json: async () => ({})
        } as Response;
      });

      const result = await NewsService.fetchAggregatedArticles({
        sources: ['nyt', 'guardian'],
        page: 1,
        pageSize: 10
      });

      expect(result.articles).toHaveLength(1);
    });
  });
});
