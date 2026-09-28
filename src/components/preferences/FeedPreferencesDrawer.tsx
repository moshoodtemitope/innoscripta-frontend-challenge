import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, Check, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  togglePreferredSource,
  togglePreferredCategory,
  addPreferredAuthor,
  removePreferredAuthor,
  setActiveTab,
  resetPreferences
} from '@/store/slices/preferencesSlice';
import { setPage } from '@/store/slices/filterSlice';
import { PROVIDERS_CONFIG, CATEGORIES_CONFIG } from '@/config/providers.config';
import { extractUniqueAuthors } from '@/utils/authors';
import type { ProviderId, ArticleCategory, Article, FetchArticlesResult } from '@/domain/article';
import styles from './FeedPreferencesDrawer.module.css';

interface FeedPreferencesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: Article[];
}

export function FeedPreferencesDrawer({ isOpen, onClose, articles = [] }: FeedPreferencesDrawerProps) {
  const [authorQuery, setAuthorQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const authorDropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.preferences);
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cachedQueries = queryClient.getQueriesData<FetchArticlesResult>({ queryKey: ['articleFeed'] });

  const availableAuthors = useMemo(() => {
    return extractUniqueAuthors(articles, cachedQueries, preferences.preferredAuthors);
  }, [articles, cachedQueries, preferences.preferredAuthors]);

  if (!isOpen) return null;

  const filteredSuggestions = availableAuthors.filter(author =>
    author.toLowerCase().includes(authorQuery.toLowerCase().trim())
  );

  const isExactMatch = availableAuthors.some(
    a => a.toLowerCase() === authorQuery.toLowerCase().trim()
  );

  const handleToggleAuthor = (author: string) => {
    if (preferences.preferredAuthors.includes(author)) {
      dispatch(removePreferredAuthor(author));
    } else {
      dispatch(addPreferredAuthor(author));
    }
  };

  const handleCustomAdd = () => {
    if (authorQuery.trim()) {
      dispatch(addPreferredAuthor(authorQuery.trim()));
      setAuthorQuery('');
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.title}>Customize "My Feed"</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Preferred News Sources</h3>
            <div className={styles.sourceGrid}>
              {Object.values(PROVIDERS_CONFIG).map(provider => {
                const isSelected = preferences.preferredSources.includes(provider.id);
                return (
                  <label key={provider.id} className={styles.sourceRow}>
                    <div className={styles.sourceInfo}>
                      <span className={styles.dot} style={{ backgroundColor: provider.brandColor }} />
                      <span className={styles.sourceName}>{provider.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => dispatch(togglePreferredSource(provider.id as ProviderId))}
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Preferred Categories</h3>
            <div className={styles.categoryWrap}>
              {CATEGORIES_CONFIG.map(cat => {
                const isSelected = preferences.preferredCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryChip} ${isSelected ? styles.chipActive : ''}`}
                    onClick={() => dispatch(togglePreferredCategory(cat.id as ArticleCategory))}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Followed Authors / Journalists</h3>
            
            <div className={styles.authorDropdownWrapper} ref={authorDropdownRef}>
              <div className={styles.authorSearchInputGroup}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.authorSearchInput}
                  placeholder="Search authors or type custom name..."
                  value={authorQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={e => {
                    setAuthorQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                />
              </div>

              {isDropdownOpen && (
                <div className={styles.authorSuggestionsMenu}>
                  {filteredSuggestions.map(author => {
                    const isFollowed = preferences.preferredAuthors.includes(author);
                    return (
                      <button
                        key={author}
                        type="button"
                        className={`${styles.suggestionItem} ${isFollowed ? styles.selectedSuggestionItem : ''}`}
                        onClick={() => handleToggleAuthor(author)}
                      >
                        <span>{author}</span>
                        {isFollowed && (
                          <span className={styles.authorCheckmarkBadge}>
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {authorQuery.trim() && !isExactMatch && (
                    <button
                      type="button"
                      className={`${styles.suggestionItem} ${styles.customAddPrompt}`}
                      onClick={handleCustomAdd}
                    >
                      <span>Add "{authorQuery.trim()}"</span>
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.authorTagList}>
              {preferences.preferredAuthors.map(author => (
                <span key={author} className={styles.authorTag}>
                  <span>{author}</span>
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={() => dispatch(removePreferredAuthor(author))}
                    aria-label={`Remove ${author}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => dispatch(resetPreferences())}
          >
            Reset Defaults
          </button>
          <button
            type="button"
            className={styles.doneButton}
            onClick={() => {
              dispatch(setActiveTab('custom'));
              dispatch(setPage(1));
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}
