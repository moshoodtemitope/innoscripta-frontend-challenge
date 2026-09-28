import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Article } from '../../domain/article';
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage';

const SAVED_ARTICLES_STORAGE_KEY = 'news_saved_articles';

export interface SavedArticlesState {
  items: Article[];
}

const initialState: SavedArticlesState = {
  items: loadFromLocalStorage<Article[]>(SAVED_ARTICLES_STORAGE_KEY, [])
};

export const savedArticlesSlice = createSlice({
  name: 'savedArticles',
  initialState,
  reducers: {
    toggleSaveArticle: (state, action: PayloadAction<Article>) => {
      const article = action.payload;
      const index = state.items.findIndex(item => item.id === article.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.unshift(article);
      }
      saveToLocalStorage(SAVED_ARTICLES_STORAGE_KEY, state.items);
    },
    removeSavedArticle: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveToLocalStorage(SAVED_ARTICLES_STORAGE_KEY, state.items);
    },
    clearSavedArticles: (state) => {
      state.items = [];
      saveToLocalStorage(SAVED_ARTICLES_STORAGE_KEY, []);
    }
  }
});

export const {
  toggleSaveArticle,
  removeSavedArticle,
  clearSavedArticles
} = savedArticlesSlice.actions;

export default savedArticlesSlice.reducer;
