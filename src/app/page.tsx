'use client';

import { useState, useEffect } from 'react';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkHeader } from '@/components/BookmarkHeader';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import { Bookmark, SortOption, SortOrder } from '@/types/bookmark';
import { useImportBookmarks } from '@/components/ImportBookmarks';
import { BookmarkForm } from '@/components/BookmarkForm';
import { SortControls } from '@/components/SortControls';
import LoadingScreen from './loading';
import { cn } from '@/utils/ui';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentSort, setCurrentSort] = useState<SortOption>('accessCount');
  const [currentOrder, setCurrentOrder] = useState<SortOrder>('desc');

  useImportBookmarks({
    onImportComplete: () => {
      const updatedBookmarks = getBookmarks();
      setBookmarks(updatedBookmarks);
      
      const tags = new Set<string>();
      updatedBookmarks.forEach(bookmark => {
        bookmark.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    }
  });

  const handleBookmarksUpdate = (updatedBookmarks: Bookmark[]) => {
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);
    
    const tags = new Set<string>();
    updatedBookmarks.forEach(bookmark => {
      if (bookmark && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  };

  useEffect(() => {
    const savedBookmarks = getBookmarks();
    const tags = new Set<string>();
    savedBookmarks.forEach(bookmark => {
      if (bookmark && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
    handleBookmarksUpdate(savedBookmarks);
    
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 300);
    }, 1000);
  }, []);

  const handleSave = (bookmarkData: Omit<Bookmark, 'id'>) => {
    let updatedBookmarks: Bookmark[];
    if (selectedBookmark) {
      updatedBookmarks = bookmarks.map(b => 
        b.id === selectedBookmark.id ? { ...b, ...bookmarkData } : b
      );
    } else {
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        ...bookmarkData
      };
      updatedBookmarks = [...bookmarks, newBookmark];
    }
    
    saveBookmarks(updatedBookmarks);
    handleBookmarksUpdate(updatedBookmarks);
    setIsModalOpen(false);
    setSelectedBookmark(undefined);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks(updatedBookmarks);
    handleBookmarksUpdate(updatedBookmarks);
  };

  const handleTogglePin = (id: string) => {
    const updatedBookmarks = bookmarks.map(b =>
      b.id === id ? { ...b, isPinned: !b.isPinned } : b
    );
    saveBookmarks(updatedBookmarks);
    handleBookmarksUpdate(updatedBookmarks);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpdateTags = (tags: string[]) => {
    const removedTags = availableTags.filter(tag => !tags.includes(tag));
    const renamedTags = new Map<string, string>();
    const newTags = tags.filter(tag => !availableTags.includes(tag));
    
    if (newTags.length === 1 && removedTags.length === 1) {
      renamedTags.set(removedTags[0], newTags[0]);
      setSelectedTags(prev => 
        prev.map(tag => renamedTags.get(tag) || tag)
      );
    }
    
    if (removedTags.length > 0) {
      setSelectedTags(prev => 
        prev.filter(tag => !removedTags.includes(tag))
      );
    }
    
    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags
        .filter(tag => !removedTags.includes(tag) || renamedTags.has(tag))
        .map(tag => renamedTags.get(tag) || tag)
    }));
    
    saveBookmarks(updatedBookmarks);
    handleBookmarksUpdate(updatedBookmarks);
    setAvailableTags(tags);
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    const updatedBookmarks = bookmarks.map(b => {
      if (b.id === bookmark.id) {
        return {
          ...b,
          accessCount: (b.accessCount || 0) + 1,
          lastAccessedAt: new Date().toISOString()
        };
      }
      return b;
    });
    saveBookmarks(updatedBookmarks);
    handleBookmarksUpdate(updatedBookmarks);
    window.open(bookmark.url, '_blank');
  };

  const sortBookmarks = (bookmarks: Bookmark[]) => {
    return [...bookmarks].sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case 'accessCount':
          comparison = (a.accessCount || 0) - (b.accessCount || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return currentOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => bookmark.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedBookmarks = sortBookmarks(filteredBookmarks);
  const pinnedBookmarks = sortedBookmarks.filter(b => b.isPinned);
  const unpinnedBookmarks = sortedBookmarks.filter(b => !b.isPinned);

  return (
    <div className="relative min-h-screen bg-dark">
      <div className={cn(
        "fixed inset-0 transition-opacity duration-700",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <LoadingScreen />
      </div>
      <main className={cn(
        "min-h-screen p-2 transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}>
        <div className="w-full">
          <BookmarkHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTags={selectedTags}
            onAddBookmark={() => {
              setSelectedBookmark(undefined);
              setIsModalOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTags={availableTags}
            onTagClick={handleTagClick}
            onUpdateTags={handleUpdateTags}
            onClearAll={() => setSelectedTags([])}
            onBookmarksUpdate={handleBookmarksUpdate}
            bookmarks={bookmarks}
          />

          <div className="my-4">
            <SortControls
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortChange={setCurrentSort}
              onOrderChange={setCurrentOrder}
            />
          </div>

          <BookmarkList
            pinnedBookmarks={pinnedBookmarks}
            unpinnedBookmarks={unpinnedBookmarks}
            viewMode={viewMode}
            onTogglePin={handleTogglePin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBookmarkClick={handleBookmarkClick}
          />

          {isModalOpen && (
            <BookmarkForm
              bookmark={selectedBookmark}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedBookmark(undefined);
              }}
              onSave={handleSave}
              availableTags={availableTags}
              onUpdateTags={handleUpdateTags}
            />
          )}
        </div>
      </main>
    </div>
  );
}
