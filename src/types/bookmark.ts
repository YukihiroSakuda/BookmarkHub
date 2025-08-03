export interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  favicon?: string;
  access_count: number;
  last_accessed_at?: string;
  user_id: string;
  custom_order?: number;
}

// フロントエンド用の型（Supabaseのデータを変換する際に使用）
export interface BookmarkUI {
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
  customOrder?: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  viewMode: 'list' | 'grid';
  customTags: string[];
  itemsPerPage: number;
}

export type SortOption = 'accessCount' | 'title' | 'createdAt' | 'custom';
export type SortOrder = 'asc' | 'desc';

// Supabaseから取得したブックマークデータの型
export interface BookmarkWithTags {
  id: string;
  title: string;
  url: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  access_count: number;
  last_accessed_at: string | null;
  user_id: string;
  custom_order?: number;
  bookmarks_tags: Array<{
    tags: {
      name: string;
    };
  }>;
}

// 型変換用のヘルパー関数
export const convertToUI = (bookmark: BookmarkWithTags): BookmarkUI => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  tags: bookmark.bookmarks_tags?.map(bt => bt.tags.name) || [],
  isPinned: bookmark.is_pinned,
  createdAt: bookmark.created_at,
  updatedAt: bookmark.updated_at,
  accessCount: bookmark.access_count,
  lastAccessedAt: bookmark.last_accessed_at || undefined,
  customOrder: bookmark.custom_order
});

export const convertToDB = (bookmark: BookmarkUI, userId: string): Omit<Bookmark, 'id'> => ({
  title: bookmark.title,
  url: bookmark.url,
  is_pinned: bookmark.isPinned,
  created_at: bookmark.createdAt,
  updated_at: bookmark.updatedAt,
  access_count: bookmark.accessCount,
  last_accessed_at: bookmark.lastAccessedAt,
  user_id: userId,
  custom_order: bookmark.customOrder
}); 