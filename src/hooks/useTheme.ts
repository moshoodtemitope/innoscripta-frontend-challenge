import { useState, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'news_theme_mode';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return loadFromLocalStorage<ThemeMode>(THEME_STORAGE_KEY, 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveToLocalStorage(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, setTheme };
}
