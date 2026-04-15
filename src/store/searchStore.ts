'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchStore {
  query: string;
  recentSearches: string[];
  trendingSearches: string[];
  setQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setTrendingSearches: (searches: string[]) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      query: '',
      recentSearches: [],
      trendingSearches: [],
      setQuery: (query) => set({ query }),
      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((s) => s !== query),
          ].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setTrendingSearches: (searches) => set({ trendingSearches: searches }),
    }),
    { name: 'search-storage' }
  )
);
