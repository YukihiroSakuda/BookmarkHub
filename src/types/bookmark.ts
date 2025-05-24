export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  favicon?: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  viewMode: 'list' | 'grid';
  customTags: string[];
  itemsPerPage: number;
}

export const DEFAULT_TAGS = [
  '技術',
  'ブログ',
  'ドキュメント',
  'ツール',
  'ニュース',
  'チュートリアル',
  '参考',
  '重要',
  '後で読む',
  'お気に入り'
]; 