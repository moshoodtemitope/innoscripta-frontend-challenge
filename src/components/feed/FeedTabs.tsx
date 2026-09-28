import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveTab } from '@/store/slices/preferencesSlice';
import { setPage } from '@/store/slices/filterSlice';
import styles from './FeedTabs.module.css';

export function FeedTabs() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.preferences.activeTab);

  const handleTabChange = (tab: 'all' | 'custom') => {
    dispatch(setActiveTab(tab));
    dispatch(setPage(1));
  };

  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
        onClick={() => handleTabChange('all')}
      >
        <span>All News</span>
        {activeTab === 'all' && <div className={styles.activeIndicator} />}
      </button>

      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'custom' ? styles.activeTab : ''}`}
        onClick={() => handleTabChange('custom')}
      >
        <span>My Feed (Personalized)</span>
        {activeTab === 'custom' && <div className={styles.activeIndicator} />}
      </button>
    </div>
  );
}
