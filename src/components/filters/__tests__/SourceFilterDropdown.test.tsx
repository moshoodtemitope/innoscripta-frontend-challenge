import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SourceFilterDropdown } from '../SourceFilterDropdown';
import filterReducer from '../../../store/slices/filterSlice';

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      filter: filterReducer
    }
  });

  return {
    user: userEvent.setup(),
    store,
    ...render(<Provider store={store}>{ui}</Provider>)
  };
}

describe('SourceFilterDropdown Component', () => {
  it('opens menu and displays all 4 news source options', async () => {
    const { user } = renderWithStore(<SourceFilterDropdown />);

    const triggerButton = screen.getByRole('button', { name: /Sources/i });
    expect(triggerButton).toBeInTheDocument();

    await user.click(triggerButton);

    expect(screen.getByText('BBC News')).toBeInTheDocument();
    expect(screen.getByText('The Guardian')).toBeInTheDocument();
    expect(screen.getByText('New York Times')).toBeInTheDocument();
    expect(screen.getByText('NewsAPI.org')).toBeInTheDocument();
  });

  it('toggles a source checkbox and updates Redux state', async () => {
    const { user, store } = renderWithStore(<SourceFilterDropdown />);

    const triggerButton = screen.getByRole('button', { name: /Sources/i });
    await user.click(triggerButton);

    const nytCheckbox = screen.getByRole('checkbox', { name: /New York Times/i });
    expect(nytCheckbox).toBeChecked();

    await user.click(nytCheckbox);

    expect(store.getState().filter.selectedSources).not.toContain('nyt');
  });

  it('clears all sources to one minimum when Clear is clicked', async () => {
    const { user, store } = renderWithStore(<SourceFilterDropdown />);

    await user.click(screen.getByRole('button', { name: /Sources/i }));
    await user.click(screen.getByRole('button', { name: /Clear/i }));

    expect(store.getState().filter.selectedSources).toHaveLength(1);
  });
});
