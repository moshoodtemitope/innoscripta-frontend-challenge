import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setDateRange } from '@/store/slices/filterSlice';
import styles from './DateFilter.module.css';

export function DateFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { startDate, endDate } = useAppSelector(state => state.filter);

  const hasActiveDate = Boolean(startDate || endDate);

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

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDateRange({ startDate: e.target.value || undefined, endDate }));
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDateRange({ startDate, endDate: e.target.value || undefined }));
  };

  const handleClear = () => {
    dispatch(setDateRange({ startDate: undefined, endDate: undefined }));
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.triggerButton} ${hasActiveDate ? styles.activeTrigger : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <Calendar size={16} />
        <span>Dates</span>
        {hasActiveDate && <span className={styles.activeBadge} />}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <span className={styles.menuTitle}>Date Range</span>
            {hasActiveDate && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>

          <div className={styles.dateField}>
            <label className={styles.fieldLabel}>From Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate || ''}
              onChange={handleStartChange}
            />
          </div>

          <div className={styles.dateField}>
            <label className={styles.fieldLabel}>To Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate || ''}
              onChange={handleEndChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
