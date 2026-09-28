import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSelectedCategory, setSelectedCategories } from '../../store/slices/filterSlice';
import { CATEGORIES_CONFIG } from '../../config/providers.config';
import type { ArticleCategory } from '../../domain/article';
import styles from './CategorySelect.module.css';

export function CategorySelect() {
  const dispatch = useAppDispatch();
  const selectedCategories = useAppSelector(state => state.filter.selectedCategories);

  const isAllSelected = selectedCategories.length === 0;

  const handleAllClick = () => {
    dispatch(setSelectedCategories([]));
  };

  const handleCategoryClick = (category: ArticleCategory) => {
    dispatch(toggleSelectedCategory(category));
  };

  return (
    <div className={styles.categoryList}>
      <button
        type="button"
        className={`${styles.pill} ${isAllSelected ? styles.activePill : ''}`}
        onClick={handleAllClick}
      >
        All Topics
      </button>

      {CATEGORIES_CONFIG.map(cat => {
        const isSelected = selectedCategories.includes(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            className={`${styles.pill} ${isSelected ? styles.activePill : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
