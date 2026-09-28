import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProviderId, ArticleCategory, UserPreferences } from '../../domain/article';
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage';

const PREFERENCES_STORAGE_KEY = 'news_user_preferences';

export interface PreferencesState extends UserPreferences {
  activeTab: 'all' | 'custom';
}

const defaultInitialState: PreferencesState = {
  preferredSources: ['bbc', 'guardian', 'nyt', 'newsapi'],
  preferredCategories: [],
  preferredAuthors: [],
  activeTab: 'all'
};

const initialState: PreferencesState = loadFromLocalStorage<PreferencesState>(
  PREFERENCES_STORAGE_KEY,
  defaultInitialState
);

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    togglePreferredSource: (state, action: PayloadAction<ProviderId>) => {
      const sourceId = action.payload;
      const index = state.preferredSources.indexOf(sourceId);
      if (index >= 0) {
        if (state.preferredSources.length > 1) {
          state.preferredSources.splice(index, 1);
        }
      } else {
        state.preferredSources.push(sourceId);
      }
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    setPreferredSources: (state, action: PayloadAction<ProviderId[]>) => {
      state.preferredSources = action.payload;
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    togglePreferredCategory: (state, action: PayloadAction<ArticleCategory>) => {
      const category = action.payload;
      const index = state.preferredCategories.indexOf(category);
      if (index >= 0) {
        state.preferredCategories.splice(index, 1);
      } else {
        state.preferredCategories.push(category);
      }
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    setPreferredCategories: (state, action: PayloadAction<ArticleCategory[]>) => {
      state.preferredCategories = action.payload;
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    addPreferredAuthor: (state, action: PayloadAction<string>) => {
      const author = action.payload.trim();
      if (author && !state.preferredAuthors.includes(author)) {
        state.preferredAuthors.push(author);
        saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
      }
    },
    removePreferredAuthor: (state, action: PayloadAction<string>) => {
      state.preferredAuthors = state.preferredAuthors.filter(a => a !== action.payload);
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'custom'>) => {
      state.activeTab = action.payload;
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    },
    resetPreferences: (state) => {
      state.preferredSources = ['bbc', 'guardian', 'nyt', 'newsapi'];
      state.preferredCategories = [];
      state.preferredAuthors = [];
      state.activeTab = 'all';
      saveToLocalStorage(PREFERENCES_STORAGE_KEY, state);
    }
  }
});

export const {
  togglePreferredSource,
  setPreferredSources,
  togglePreferredCategory,
  setPreferredCategories,
  addPreferredAuthor,
  removePreferredAuthor,
  setActiveTab,
  resetPreferences
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
