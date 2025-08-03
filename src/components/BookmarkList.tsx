import { BookmarkUI } from '@/types/bookmark';
import { BookmarkCard } from './BookmarkCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BookmarkListProps {
  pinnedBookmarks: BookmarkUI[];
  unpinnedBookmarks: BookmarkUI[];
  viewMode: 'list' | 'grid';
  listColumns: 1 | 2 | 3 | 4;
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: BookmarkUI) => void;
  onDelete: (id: string) => void;
  onBookmarkClick: (bookmark: BookmarkUI) => void;
  isOrderingMode?: boolean;
  onReorder?: (oldIndex: number, newIndex: number, isPinned: boolean) => void;
}

interface SortableBookmarkCardProps {
  bookmark: BookmarkUI;
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: BookmarkUI) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
  isOrderingMode: boolean;
}

function SortableBookmarkCard({
  bookmark,
  viewMode,
  onTogglePin,
  onEdit,
  onDelete,
  onClick,
  isOrderingMode,
}: SortableBookmarkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BookmarkCard
        bookmark={bookmark}
        viewMode={viewMode}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={isOrderingMode ? () => {} : onClick}
        isOrderingMode={isOrderingMode}
      />
    </div>
  );
}

export function BookmarkList({
  pinnedBookmarks,
  unpinnedBookmarks,
  viewMode,
  listColumns,
  onTogglePin,
  onEdit,
  onDelete,
  onBookmarkClick,
  isOrderingMode = false,
  onReorder,
}: BookmarkListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // 動的なレイアウトクラスを生成
  const getLayoutClasses = () => {
    if (isOrderingMode) {
      return "grid grid-cols-1 gap-2";
    }
    
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onReorder) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      // Determine if the dragged item is pinned
      const isPinnedActive = pinnedBookmarks.some(b => b.id === activeId);
      const isPinnedOver = pinnedBookmarks.some(b => b.id === overId);
      
      // Only allow reordering within the same section (pinned or unpinned)
      if (isPinnedActive === isPinnedOver) {
        const items = isPinnedActive ? pinnedBookmarks : unpinnedBookmarks;
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);
        
        onReorder(oldIndex, newIndex, isPinnedActive);
      }
    }
  };

  const renderBookmarks = (bookmarks: BookmarkUI[]) => {
    if (isOrderingMode) {
      return bookmarks.map((bookmark) => (
        <SortableBookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          viewMode="list"
          onTogglePin={onTogglePin}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => onBookmarkClick(bookmark)}
          isOrderingMode={isOrderingMode}
        />
      ));
    }
    
    return bookmarks.map((bookmark) => (
      <BookmarkCard
        key={bookmark.id}
        bookmark={bookmark}
        viewMode={viewMode}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={() => onBookmarkClick(bookmark)}
        isOrderingMode={isOrderingMode}
      />
    ));
  };

  if (isOrderingMode) {
    return (
      <div className="flex flex-col gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Pinned Bookmarks */}
          {pinnedBookmarks.length > 0 && (
            <div>
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Pinned Bookmarks
              </div>
              <SortableContext
                items={pinnedBookmarks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={getLayoutClasses()}>
                  {renderBookmarks(pinnedBookmarks)}
                </div>
              </SortableContext>
            </div>
          )}

          {/* Separator */}
          {pinnedBookmarks.length > 0 && unpinnedBookmarks.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-600 my-1"></div>
          )}

          {/* Unpinned Bookmarks */}
          {unpinnedBookmarks.length > 0 && (
            <div>
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Other Bookmarks
              </div>
              <SortableContext
                items={unpinnedBookmarks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={getLayoutClasses()}>
                  {renderBookmarks(unpinnedBookmarks)}
                </div>
              </SortableContext>
            </div>
          )}
        </DndContext>
      </div>
    );
  }

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