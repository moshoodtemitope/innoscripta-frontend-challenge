import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveTab } from '../../store/slices/preferencesSlice';
import styles from './FeedTabs.module.css';

export function FeedTabs() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.preferences.activeTab);

  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
        onClick={() => dispatch(setActiveTab('all'))}
      >
        <span>All News</span>
        {activeTab === 'all' && <div className={styles.activeIndicator} />}
      </button>

      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'custom' ? styles.activeTab : ''}`}
        onClick={() => dispatch(setActiveTab('custom'))}
      >
        <span>My Feed (Personalized)</span>
        {activeTab === 'custom' && <div className={styles.activeIndicator} />}
      </button>
    </div>
  );
}
