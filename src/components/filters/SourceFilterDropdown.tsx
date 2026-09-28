import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSelectedSource, setSelectedSources } from '@/store/slices/filterSlice';
import { PROVIDERS_CONFIG } from '@/config/providers.config';
import type { ProviderId } from '@/domain/article';
import styles from './SourceFilterDropdown.module.css';

export function SourceFilterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const selectedSources = useAppSelector(state => state.filter.selectedSources);

  const allProviders = Object.values(PROVIDERS_CONFIG);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (id: ProviderId) => {
    dispatch(toggleSelectedSource(id));
  };

  const handleSelectAll = () => {
    dispatch(setSelectedSources(['bbc', 'guardian', 'nyt', 'newsapi']));
  };

  const handleClearAll = () => {
    dispatch(setSelectedSources(['bbc']));
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button
        type="button"
        className={styles.triggerButton}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <span>Sources</span>
        <span className={styles.badge}>{selectedSources.length}/{allProviders.length}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.quickActions}>
            <button type="button" className={styles.actionButton} onClick={handleSelectAll}>
              Select All
            </button>
            <button type="button" className={styles.actionButton} onClick={handleClearAll}>
              Clear
            </button>
          </div>

          <div className={styles.sourceList}>
            {allProviders.map(provider => {
              const isChecked = selectedSources.includes(provider.id);
              return (
                <label key={provider.id} className={styles.sourceItem}>
                  <div className={styles.sourceLabel}>
                    <span 
                      className={styles.colorDot} 
                      style={{ backgroundColor: provider.brandColor }}
                    />
                    <span>{provider.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isChecked}
                    onChange={() => handleToggle(provider.id)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
