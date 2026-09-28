import styles from './SkeletonCard.module.css';

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonMedia} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} ${styles.shortLine}`} />
        <div className={`${styles.skeletonLine} ${styles.titleLine}`} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  );
}
