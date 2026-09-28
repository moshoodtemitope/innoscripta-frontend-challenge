import { Moon, Sun, Sliders, Bookmark } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenPreferences: () => void;
  onOpenSavedModal: () => void;
}

export function Header({ onOpenPreferences, onOpenSavedModal }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const savedCount = useAppSelector(state => state.savedArticles.items.length);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brandGroup}>
          <div className={styles.brandIcon}>N</div>
          <span className={styles.brandName}>NewsTrack</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.bookmarkBadge}`}
            onClick={onOpenSavedModal}
            aria-label="View saved articles"
          >
            <Bookmark size={18} />
            {savedCount > 0 && <span className={styles.badgeCount}>{savedCount}</span>}
          </button>

          <button
            type="button"
            className={styles.customizeButton}
            onClick={onOpenPreferences}
          >
            <Sliders size={16} />
            <span>Customize Feed</span>
          </button>
        </div>
      </div>
    </header>
  );
}
