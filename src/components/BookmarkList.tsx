import { Bookmark } from '@/types/bookmark';
import { BookmarkCard } from './BookmarkCard';

interface BookmarkListProps {
  pinnedBookmarks: Bookmark[];
  unpinnedBookmarks: Bookmark[];
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onBookmarkClick: (bookmark: Bookmark) => void;
  onTagClick: (tag: string) => void;
}

export function BookmarkList({
  pinnedBookmarks,
  unpinnedBookmarks,
  viewMode,
  onTogglePin,
  onEdit,
  onDelete,
  onBookmarkClick,
  onTagClick,
}: BookmarkListProps) {
  const renderBookmarks = (bookmarks: Bookmark[]) => (
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
        <div className={viewMode === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        : "flex flex-col space-y-2"
        }>
        {renderBookmarks(pinnedBookmarks)}
        </div>
      )}

      {/* Separator */}
      {pinnedBookmarks.length > 0 && unpinnedBookmarks.length > 0 && (
        <div className="border-t border-energy-purple/20 my-1"></div>
      )}

      {/* Unpinned Bookmarks */}
      {unpinnedBookmarks.length > 0 && (
        <div>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            : "flex flex-col space-y-2"
          }>
            {renderBookmarks(unpinnedBookmarks)}
          </div>
        </div>
      )}

      {pinnedBookmarks.length === 0 && unpinnedBookmarks.length === 0 && (
         <div className="text-center py-12 text-white/60">
           <p>No bookmarks found.</p>
         </div>
      )}
    </div>
  );
} 