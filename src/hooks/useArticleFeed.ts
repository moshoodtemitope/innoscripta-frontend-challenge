import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store';
import { NewsService } from '@/services/newsService';
import { useDebounce } from './useDebounce';
import type { FetchArticlesParams, FetchArticlesResult } from '@/domain/article';

export function useArticleFeed() {
  const filterState = useAppSelector(state => state.filter);
  const preferencesState = useAppSelector(state => state.preferences);

  const debouncedQuery = useDebounce(filterState.query, 400);

  const isCustomTab = preferencesState.activeTab === 'custom';

  const fetchParams: FetchArticlesParams = isCustomTab
    ? {
        query: debouncedQuery || undefined,
        sources: preferencesState.preferredSources,
        categories: preferencesState.preferredCategories.length > 0 ? preferencesState.preferredCategories : undefined,
        authors: preferencesState.preferredAuthors.length > 0 ? preferencesState.preferredAuthors : undefined,
        startDate: filterState.startDate,
        endDate: filterState.endDate,
        page: filterState.page,
        pageSize: filterState.pageSize
      }
    : {
        query: debouncedQuery || undefined,
        sources: filterState.selectedSources,
        categories: filterState.selectedCategories.length > 0 ? filterState.selectedCategories : undefined,
        startDate: filterState.startDate,
        endDate: filterState.endDate,
        page: filterState.page,
        pageSize: filterState.pageSize
      };

  const queryResult = useQuery<FetchArticlesResult, Error>({
    queryKey: ['articleFeed', fetchParams],
    queryFn: () => NewsService.fetchAggregatedArticles(fetchParams),
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  return {
    ...queryResult,
    activeParams: fetchParams,
    isCustomTab
  };
}
