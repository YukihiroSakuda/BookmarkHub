export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  favicon?: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  viewMode: 'list' | 'grid';
  customTags: string[];
  itemsPerPage: number;
}

export const DEFAULT_TAGS = [
  'Technology',
  'Blog',
  'Documentation',
  'Tools',
  'News',
  'Tutorial',
  'Reference',
  'Important',
  'Read Later',
  'Favorite'
];

export type SortOption = 'accessCount' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc'; 