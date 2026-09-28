import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import preferencesReducer from './slices/preferencesSlice';
import savedArticlesReducer from './slices/savedArticlesSlice';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    savedArticles: savedArticlesReducer,
    filter: filterReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
