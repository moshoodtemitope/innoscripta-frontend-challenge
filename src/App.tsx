import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/filters/SearchBar';
import { SourceFilterDropdown } from './components/filters/SourceFilterDropdown';
import { DateFilter } from './components/filters/DateFilter';
import { CategorySelect } from './components/filters/CategorySelect';
import { FeedTabs } from './components/feed/FeedTabs';
import { ArticleGrid } from './components/feed/ArticleGrid';
import { PaginationBar } from './components/feed/PaginationBar';
import { FeedPreferencesDrawer } from './components/preferences/FeedPreferencesDrawer';
import { SavedArticlesModal } from './components/preferences/SavedArticlesModal';
import { useArticleFeed } from './hooks/useArticleFeed';
import { useAppSelector } from './store';
import styles from './App.module.css';

export function App() {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isMobileFiltersVisible, setIsMobileFiltersVisible] = useState(false);

  const { data, isLoading } = useArticleFeed();
  const filterState = useAppSelector(state => state.filter);

  const hasActiveFilters = Boolean(
    filterState.query ||
    filterState.startDate ||
    filterState.endDate ||
    filterState.selectedCategories.length > 0 ||
    filterState.selectedSources.length < 4
  );

  const articles = data?.articles || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className={styles.mainLayout}>
      <Header
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      <main className={styles.mainContent}>
        <div className={styles.mobileFilterToggleRow}>
          <button
            type="button"
            className={styles.mobileFilterButton}
            onClick={() => setIsMobileFiltersVisible(prev => !prev)}
          >
            {isMobileFiltersVisible ? <X size={16} /> : <Filter size={16} />}
            <span>{isMobileFiltersVisible ? 'Hide Filters' : 'Filter News'}</span>
            {hasActiveFilters && <span className={styles.filterActiveBadge} />}
          </button>
        </div>

        <div className={`${styles.toolbar} ${isMobileFiltersVisible ? styles.toolbarVisibleMobile : ''}`}>
          <div className={styles.searchRow}>
            <SearchBar />
            <div className={styles.filterControls}>
              <SourceFilterDropdown />
              <DateFilter />
            </div>
          </div>

          <div className={styles.filtersRow}>
            <CategorySelect />
          </div>
        </div>

        <FeedTabs />

        <ArticleGrid articles={articles} isLoading={isLoading} />

        <PaginationBar totalPages={totalPages} />
      </main>

      <FeedPreferencesDrawer
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      <SavedArticlesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
      />
    </div>
  );
}

export default App;
