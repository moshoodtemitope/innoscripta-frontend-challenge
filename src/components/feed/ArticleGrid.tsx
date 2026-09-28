import { ArticleCard } from './ArticleCard';
import { SkeletonCard } from './SkeletonCard';
import type { Article } from '../../domain/article';
import styles from './ArticleGrid.module.css';

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
}

export function ArticleGrid({ articles, isLoading }: ArticleGridProps) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No articles found</h3>
          <p className={styles.emptyDesc}>
            Try adjusting your search keyword, selecting different topics, or toggling more news sources in the filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
