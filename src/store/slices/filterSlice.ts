import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProviderId, ArticleCategory } from '../../domain/article';

export interface FilterState {
  query: string;
  selectedCategories: ArticleCategory[];
  selectedSources: ProviderId[];
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const initialState: FilterState = {
  query: '',
  selectedCategories: [],
  selectedSources: ['bbc', 'guardian', 'nyt', 'newsapi'],
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 10
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.page = 1;
    },
    setSelectedCategories: (state, action: PayloadAction<ArticleCategory[]>) => {
      state.selectedCategories = action.payload;
      state.page = 1;
    },
    toggleSelectedCategory: (state, action: PayloadAction<ArticleCategory>) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index >= 0) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(category);
      }
      state.page = 1;
    },
    setSelectedSources: (state, action: PayloadAction<ProviderId[]>) => {
      state.selectedSources = action.payload;
      state.page = 1;
    },
    toggleSelectedSource: (state, action: PayloadAction<ProviderId>) => {
      const source = action.payload;
      const index = state.selectedSources.indexOf(source);
      if (index >= 0) {
        if (state.selectedSources.length > 1) {
          state.selectedSources.splice(index, 1);
        }
      } else {
        state.selectedSources.push(source);
      }
      state.page = 1;
    },
    setDateRange: (state, action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    resetFilters: (state) => {
      state.query = '';
      state.selectedCategories = [];
      state.selectedSources = ['bbc', 'guardian', 'nyt', 'newsapi'];
      state.startDate = undefined;
      state.endDate = undefined;
      state.page = 1;
      state.pageSize = 10;
    }
  }
});

export const {
  setQuery,
  setSelectedCategories,
  toggleSelectedCategory,
  setSelectedSources,
  toggleSelectedSource,
  setDateRange,
  setPage,
  setPageSize,
  resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;
