import { X, Trash2, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeSavedArticle } from '../../store/slices/savedArticlesSlice';
import styles from './SavedArticlesModal.module.css';

interface SavedArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedArticlesModal({ isOpen, onClose }: SavedArticlesModalProps) {
  const dispatch = useAppDispatch();
  const savedArticles = useAppSelector(state => state.savedArticles.items);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Saved Articles ({savedArticles.length})</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {savedArticles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No saved articles yet. Click the bookmark icon on any article card to save it for later.</p>
            </div>
          ) : (
            savedArticles.map(article => (
              <div key={article.id} className={styles.savedItem}>
                <div className={styles.itemInfo}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.itemTitle}
                  >
                    <span>{article.title}</span>
                    <ExternalLink size={12} style={{ display: 'inline', marginLeft: '0.35rem' }} />
                  </a>
                  <span className={styles.itemSource}>{article.source.name}</span>
                </div>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => dispatch(removeSavedArticle(article.id))}
                  aria-label="Remove saved article"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
