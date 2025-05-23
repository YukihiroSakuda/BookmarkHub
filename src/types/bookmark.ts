export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  viewMode: 'list' | 'grid';
  customTags: string[];
  itemsPerPage: number;
}

export const DEFAULT_TAGS = [
  '仕事',
  '学習',
  '趣味',
  'ニュース',
  '参考資料',
  'ツール',
  'よく使う',
  '後で見る',
  'ショッピング',
  'エンターテイメント',
  'SNS',
  '技術・IT',
] as const; 