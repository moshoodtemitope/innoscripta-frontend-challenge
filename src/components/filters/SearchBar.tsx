import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setQuery } from '../../store/slices/filterSlice';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector(state => state.filter.query);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuery(e.target.value));
  };

  const handleClear = () => {
    dispatch(setQuery(''));
  };

  return (
    <div className={styles.searchContainer}>
      <Search size={18} className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search headlines, topics, keywords..."
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
