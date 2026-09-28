# NewsTrack — News Aggregator Application

A responsive news aggregation web application built with **React 19**, **TypeScript**, **Redux Toolkit**, **TanStack Query**, and **CSS**, fully containerized using **Docker** and **Nginx**.

NewsTrack brings together articles from four major news providers into a single reading experience:
- **BBC News** (Public JSON feed)
- **The Guardian** (Authenticated REST API)
- **The New York Times** (Authenticated REST API)
- **NewsAPI** (Authenticated REST API)

---

## What Has Been Implemented

### 1. Multi-Source Aggregation
- **Simultaneous Data Fetching**: When you search or browse, the application queries all selected news outlets in parallel using `Promise.allSettled`.
- **Fault-Tolerant Feed**: If any single third-party provider is down, slow, or exhausts its rate limit, the feed doesn't crash. It isolates the failed provider and displays articles from all healthy sources.
- **Cross-Source Deduplication**: Major world events are often covered simultaneously by BBC, The Guardian, and NYT. The aggregation engine detects duplicate headlines across sources and deduplicates them so the feed stays clean.
- **Chronological Sorting**: Stories from all outlets are merged and sorted by publication date from newest to oldest.

### 2. Search & Filtering
- **Debounced Keyword Search**: Search titles and descriptions with an automatic 400ms debounce to prevent firing unnecessary API calls while typing.
- **Source Filter Dropdown**: Multi-select dropdown popover with individual source checkboxes, selection counters, and a single-click clear button.
- **Category Filter Pills**: Quick-filtering across 7 standardized news categories: *General, Business, Technology, Entertainment, Sports, Science,* and *Health*.
- **Date Range Picker**: Dedicated *From* and *To* date controls that validate date constraints and correctly format queries for each underlying provider API.

### 3. Personalized "My Feed"
- **Customized Reading Experience**: A dedicated tab separate from "Explore All" that shows articles based on your personal reading tastes.
- **Preferences**:
  - Choose your preferred sources and categories.
  - **Searchable Author Dropdown**:  Search Input that filters journalist and author names dynamically with checkmark selection and removable chips.
  - Automatically persisted in browser's `localStorage` so your preferences remain intact when you return.

### 4. Reading List / Bookmarks
- **One-Click Save**: Bookmark any article card using the ribbon icon.
- **Saved Articles Modal**: Access your saved reading list anytime from the header badge, view source details, open original articles in a new tab, or remove items.
- Persisted locally across sessions via `localStorage`.

### 5. Responsive UI & Theming
- **Mobile-First Layout**: Automatically adapts from a clean 1-column layout on phones to 3 columns on desktops.
- **Mobile Filter Accordion**: A dedicated `[ Filter News ]` toggle button keeps mobile screens distraction-free until filters are needed.
- **Light & Dark Themes**: High-contrast theme toggle (Sun/Moon) using CSS custom properties with zero runtime CSS-in-JS overhead.
- **Shimmer Placeholders**: Card placeholders prevent layout shift while data is loading.

---

## How the Architecture Works

The codebase is structured around a **4-layer Clean Architecture** to keep the code organized, easy to test, and simple to maintain:

```
[ Domain Layer ]       <-- Pure types (Article, Categories) with no framework dependencies
       ▲
[ Adapter Layer ]      <-- Adapters that translate news source APIs into the domain
       ▲
[ State Layer ]        <-- Redux (UI state) + React Query (server cache)
       ▲
[ Presentation Layer ] <-- React components and CSS Modules
```

### 1. The Adapter Pattern
Every news provider formats data differently:
- The Guardian requires `api-key` and uses ISO dates (`2026-09-28`).
- The New York Times uses 0-indexed page numbers (page 1 is `0`) and requires dates formatted without dashes (`20260928`).
- BBC News provides categories under dynamic object keys and does not provide publication dates.
- NewsAPI requires switching between `/top-headlines` and `/everything` depending on whether a search query is present.

Rather than scattering `if/else` checks throughout the user interface, we are using the **Adapter Pattern**:
- An abstract `BaseAdapter` defines a simple contract: `fetchArticles(params)`.
- Each news source has its own isolated adapter (`BbcAdapter`, `GuardianAdapter`, `NytAdapter`, `NewsApiAdapter`).
- Each adapter handles its own authentication, parameter translation, and error handling, returning clean, identical `Article` objects.
- If you ever need to add a 5th news source (like Reuters or Bloomberg), you write one new adapter file without touching existing code.

### 2. Separating Redux Toolkit and React Query
Instead of storing everything in one giant Redux store, we divided state by its needs:
- **Redux Toolkit**: Manages **client-side UI state** (what keyword is typed, which filters are active, which drawer is open, and bookmarked articles). This data is synchronous and lives in the browser.
- **TanStack React Query**: Manages **server cache state** (fetching articles, caching responses for 5 minutes, query deduplication, loading indicators, and error states).
This separation eliminates dozens of lines of repetitive Redux boilerplate (loading flags, error reducers, and manual fetch thunks).


---

## How to Run the App

### Option A: Running with Docker (Recommended)

The app is fully containerized with a multi-stage Docker build:
1. **Stage 1 (Builder)** compiles the TypeScript React code into optimized production assets.
2. **Stage 2 (Production)** serves the static bundle using a hardened, ultra-lightweight **Nginx Alpine** image (~25MB) with Gzip compression and SPA routing enabled.

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### Steps:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/moshoodtemitope/innoscripta-frontend-challenge.git
   cd innoscripta-frontend-challenge
   ```

2. **Configure your API keys in `.env`**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   The `.env` has KEYs needed for testing ( and you can paste your API keys if you have yours, I have some keys in .env already):
   ```env
   VITE_GUARDIAN_API_KEY=guardian_key_here
   VITE_NYT_API_KEY=nyt_key_here
   VITE_NEWSAPI_KEY=newsapi_key_here
   ```
   *(The BBC News source is unofficial and public so it does not require an API key)*.

3. **Start the container with Docker Compose**:
   ```bash
   docker compose up --build
   ```

4. **Open your browser**:
   Navigate to:
   ```
   http://localhost:8080
   ```

5. **Stop the container**:
   ```bash
   docker compose down
   ```

*(Alternatively, to run with plain Docker commands without compose)*:
```bash
docker build \
  --build-arg VITE_GUARDIAN_API_KEY=your_guardian_key \
  --build-arg VITE_NYT_API_KEY=your_nyt_key \
  --build-arg VITE_NEWSAPI_KEY=your_newsapi_key \
  -t newstrack-app .

docker run -p 8080:80 newstrack-app
```

---

### Option B: Running Locally (Node.js)

#### Prerequisites
- **Node.js** >= 20.x
- **npm** >= 10.x

#### Steps:
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure `.env`**:
   Ensure `.env` exists in the project root with your API keys:
   ```env
   VITE_GUARDIAN_API_KEY=your_guardian_key_here
   VITE_NYT_API_KEY=your_nyt_key_here
   VITE_NEWSAPI_KEY=your_newsapi_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open:
   ```
   http://localhost:5173
   ```

4. **Build and preview production bundle locally**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Running Automated Tests

The project includes unit and integration tests powered by **Vitest** and **React Testing Library**:
- **Adapter Unit Tests**: Verifies API parameter mapping, 0-indexed pagination (NYT), missing date handling (BBC), and error resilience across all 4 news adapters.
- **Aggregation Engine Tests**: Verifies multi-source parallel aggregation, headline deduplication, and chronological ordering.
- **UI Integration Tests**: Tests article card rendering, date omission logic, bookmark dispatching, and source filter dropdown interactions.

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

---

## Project Structure

```
innoscripta-frontend-challenge/
├── src/
│   ├── config/              # Provides news source  brand colors, labels, and metadata
│   ├── domain/              # TypeScript domain types (Article, ProviderId, Categories)
│   ├── hooks/               # useArticleFeed (React Query), useDebounce, useTheme
│   ├── services/
│   │   ├── apiUrls.ts       # Centralized API endpoint constants
│   │   ├── newsService.ts   # Core aggregator (Promise.allSettled, deduplication, sorting)
│   │   └── providers/       # Adapter pattern implementations (BBC, Guardian, NYT, NewsAPI)
│   ├── store/               # Redux Toolkit store and slices (filters, preferences, saved articles)
│   ├── styles/              # Design tokens (variables.css) and CSS resets (global.css)
│   ├── components/
│   │   ├── feed/            # ArticleCard, ArticleGrid, FeedTabs, SkeletonCard, PaginationBar
│   │   ├── filters/         # SearchBar, SourceFilterDropdown, DateFilter, CategorySelect
│   │   ├── layout/          # Custom header, Logo, ThemeToggle, SavedBadge
│   │   └── preferences/     # FeedPreferencesDrawer, SavedArticlesModal
│   ├── test/                # Test environment setup with Jest DOM matchers
│   ├── App.tsx              # Main application layout and coordinator
│   └── main.tsx             # Application entry point (Providers & QueryClient)
├── Dockerfile               # Multi-stage production Dockerfile (Node 20 -> Nginx Alpine)
├── docker-compose.yml       # Docker Compose service definition (port 8080)
├── nginx.conf               # Nginx reverse proxy, SPA routing, and gzip configuration
├── vite.config.ts           # Vite dev server proxy and Vitest configuration
└── README.md
```

---

## License
MIT
