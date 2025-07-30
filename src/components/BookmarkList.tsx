import { BookmarkUI } from '@/types/bookmark';
import { BookmarkCard } from './BookmarkCard';

interface BookmarkListProps {
  pinnedBookmarks: BookmarkUI[];
  unpinnedBookmarks: BookmarkUI[];
  viewMode: 'list' | 'grid';
  listColumns: 1 | 2 | 3 | 4;
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: BookmarkUI) => void;
  onDelete: (id: string) => void;
  onBookmarkClick: (bookmark: BookmarkUI) => void;
}

export function BookmarkList({
  pinnedBookmarks,
  unpinnedBookmarks,
  viewMode,
  listColumns,
  onTogglePin,
  onEdit,
  onDelete,
  onBookmarkClick
}: BookmarkListProps) {
  // 動的なレイアウトクラスを生成
  const getLayoutClasses = () => {
    if (viewMode === 'grid') {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
    }
    
    // リスト表示時の列数設定
    const columnClasses = {
      1: "grid grid-cols-1 gap-2",
      2: "grid grid-cols-1 sm:grid-cols-2 gap-2",
      3: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2",
      4: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
    };
    
    return columnClasses[listColumns];
  };

  const renderBookmarks = (bookmarks: BookmarkUI[]) => (
    bookmarks.map((bookmark) => (
      <BookmarkCard
        key={bookmark.id}
        bookmark={bookmark}
        viewMode={viewMode}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={() => onBookmarkClick(bookmark)}
      />
    ))
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Pinned Bookmarks */}
      {pinnedBookmarks.length > 0 && (
        <div className={getLayoutClasses()}>
          {renderBookmarks(pinnedBookmarks)}
        </div>
      )}

      {/* Separator */}
      {pinnedBookmarks.length > 0 && unpinnedBookmarks.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-600 my-1"></div>
      )}

      {/* Unpinned Bookmarks */}
      {unpinnedBookmarks.length > 0 && (
        <div className={getLayoutClasses()}>
          {renderBookmarks(unpinnedBookmarks)}
        </div>
      )}

      {pinnedBookmarks.length === 0 && unpinnedBookmarks.length === 0 && (
        <div className="text-center py-1">
          <p>No bookmarks found.</p>
        </div>
      )}
    </div>
  );
} 