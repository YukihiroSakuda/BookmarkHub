import { Bookmark, Settings } from '@/types/bookmark';

const BOOKMARKS_KEY = 'bookmarks';
const SETTINGS_KEY = 'settings';

export const getBookmarks = (): Bookmark[] => {
  if (typeof window === 'undefined') return [];
  const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
  return bookmarks ? JSON.parse(bookmarks) : [];
};

export const saveBookmarks = (bookmarks: Bookmark[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
};

export const getSettings = (): Settings => {
  if (typeof window === 'undefined') {
    return {
      theme: 'light',
      viewMode: 'grid',
      customTags: [],
      itemsPerPage: 12,
    };
  }
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    theme: 'light',
    viewMode: 'grid',
    customTags: [],
    itemsPerPage: 12,
  };
};

export const saveSettings = (settings: Settings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}; 