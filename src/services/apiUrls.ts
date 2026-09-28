export const API_URLS = {
  bbc: {
    latest: 'https://bbc-news-api.vercel.app/latest?lang=english',
    news: 'https://bbc-news-api.vercel.app/news?lang=english'
  },
  guardian: {
    search: 'https://content.guardianapis.com/search'
  },
  nyt: {
    articleSearch: 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
    assetHost: 'https://static01.nyt.com/'
  },
  newsapi: {
    topHeadlines: 'https://newsapi.org/v2/top-headlines',
    everything: 'https://newsapi.org/v2/everything'
  }
} as const;
