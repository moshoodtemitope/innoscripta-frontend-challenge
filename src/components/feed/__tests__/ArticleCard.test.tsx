import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ArticleCard } from '../ArticleCard';
import savedArticlesReducer from '../../../store/slices/savedArticlesSlice';
import type { Article } from '../../../domain/article';

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      savedArticles: savedArticlesReducer
    }
  });

  return {
    user: userEvent.setup(),
    store,
    ...render(<Provider store={store}>{ui}</Provider>)
  };
}

describe('ArticleCard Component', () => {
  const mockArticle: Article = {
    id: 'guardian-123',
    title: 'Breakthrough in Quantum Computing',
    summary: 'Researchers have made an astonishing discovery in quantum physics.',
    url: 'https://theguardian.com/quantum',
    imageUrl: 'https://theguardian.com/image.jpg',
    publishedAt: '2026-09-28T08:00:00Z',
    source: { id: 'guardian', name: 'The Guardian' },
    author: 'Alice Johnson',
    category: 'technology'
  };

  it('renders article headline, source badge, author, and formatted date', () => {
    renderWithStore(<ArticleCard article={mockArticle} />);

    expect(screen.getByText('Breakthrough in Quantum Computing')).toBeInTheDocument();
    expect(screen.getByText('The Guardian')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read/i })).toHaveAttribute('href', mockArticle.url);
  });

  it('does not render date element when publishedAt is undefined (BBC)', () => {
    const bbcArticle: Article = {
      ...mockArticle,
      id: 'bbc-456',
      source: { id: 'bbc', name: 'BBC News' },
      publishedAt: undefined
    };

    const { container } = renderWithStore(<ArticleCard article={bbcArticle} />);

    expect(container.querySelector('time')).toBeNull();
  });

  it('toggles saved bookmark state when bookmark button is clicked', async () => {
    const { user, store } = renderWithStore(<ArticleCard article={mockArticle} />);

    const bookmarkButton = screen.getByRole('button', { name: /Save article/i });
    expect(store.getState().savedArticles.items).toHaveLength(0);

    await user.click(bookmarkButton);

    expect(store.getState().savedArticles.items).toHaveLength(1);
    expect(store.getState().savedArticles.items[0].id).toBe(mockArticle.id);

    await user.click(bookmarkButton);

    expect(store.getState().savedArticles.items).toHaveLength(0);
  });
});
