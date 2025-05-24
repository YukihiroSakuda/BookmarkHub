# 型定義

## Bookmark
ブックマークの基本情報を定義する型

```typescript
interface Bookmark {
  id: string;          // 一意のID
  title: string;       // タイトル
  url: string;         // URL
  tags: string[];      // タグの配列
  isPinned: boolean;   // ピン留め状態
  createdAt: string;   // 作成日時
  updatedAt: string;   // 更新日時
}
```

## 定数

### DEFAULT_TAGS
デフォルトで使用されるタグの配列

```typescript
const DEFAULT_TAGS = [
  'work',
  'personal',
  'important',
  'reading',
  'reference'
];
```

## コンポーネントのProps型

### BookmarkCardProps
```typescript
interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}
```

### BookmarkFormProps
```typescript
interface BookmarkFormProps {
  bookmark?: Bookmark;
  onClose: () => void;
  onSave: (bookmarkData: Omit<Bookmark, 'id'>) => void;
  availableTags: string[];
}
```

### BookmarkHeaderProps
```typescript
interface BookmarkHeaderProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onAddBookmark: () => void;
  onTagManagerOpen: () => void;
  pinnedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: string[];
  onTagClick: (tag: string) => void;
  onUpdateTags: (tags: string[]) => void;
  selectedTagView: string | null;
}
```

### BookmarkListProps
```typescript
interface BookmarkListProps {
  pinnedBookmarks: Bookmark[];
  unpinnedBookmarks: Bookmark[];
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}
```

### TagManagerProps
```typescript
interface TagManagerProps {
  availableTags: string[];
  onClose: () => void;
  onUpdateTags: (tags: string[]) => void;
}
```

## ユーティリティ型

### StorageKey
LocalStorageのキーを定義する型

```typescript
type StorageKey = 'bookmarks' | 'tags';
```

## 使用例

### ブックマークの作成
```typescript
const newBookmark: Bookmark = {
  id: crypto.randomUUID(),
  title: 'Example Bookmark',
  url: 'https://example.com',
  tags: ['work', 'reference'],
  isPinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### ブックマークの更新
```typescript
const updatedBookmark: Bookmark = {
  ...bookmark,
  title: 'Updated Title',
  updatedAt: new Date().toISOString()
};
``` 