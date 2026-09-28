import { Bookmark, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSaveArticle } from '../../store/slices/savedArticlesSlice';
import { PROVIDERS_CONFIG } from '../../config/providers.config';
import type { Article } from '../../domain/article';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const dispatch = useAppDispatch();
  const savedArticles = useAppSelector(state => state.savedArticles.items);

  const isSaved = savedArticles.some(item => item.id === article.id);
  const providerInfo = PROVIDERS_CONFIG[article.source.id];
  const brandColor = providerInfo ? providerInfo.brandColor : '#2563eb';

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const handleBookmarkToggle = () => {
    dispatch(toggleSaveArticle(article));
  };

  return (
    <article className={styles.card}>
      <div className={styles.mediaWrapper}>
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{article.source.name}</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span 
            className={styles.sourceBadge} 
            style={{ backgroundColor: brandColor }}
          >
            {article.source.name}
          </span>
          {formattedDate && <time className={styles.date}>{formattedDate}</time>}
        </div>

        <h3 className={styles.title}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.titleLink}
          >
            {article.title}
          </a>
        </h3>

        <p className={styles.summary}>{article.summary}</p>

        <div className={styles.cardFooter}>
          <span className={styles.author}>{article.author}</span>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.saveButton} ${isSaved ? styles.savedActive : ''}`}
              onClick={handleBookmarkToggle}
              aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.readMore}
            >
              <span>Read</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
