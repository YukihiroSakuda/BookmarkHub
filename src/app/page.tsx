'use client';

import { useState, useEffect } from 'react';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkHeader } from '@/components/BookmarkHeader';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import { Bookmark } from '@/types/bookmark';
import { useImportBookmarks } from '@/components/ImportBookmarks';
import { BookmarkForm } from '@/components/BookmarkForm';

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  useImportBookmarks({
    onImportComplete: () => {
      // インポート完了時にブックマークリストを更新
      const updatedBookmarks = getBookmarks();
      setBookmarks(updatedBookmarks);
      
      // タグリストも更新
      const tags = new Set<string>();
      updatedBookmarks.forEach(bookmark => {
        bookmark.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    }
  });

  const handleBookmarksUpdate = (updatedBookmarks: Bookmark[]) => {
    setBookmarks(updatedBookmarks);
    
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
    handleBookmarksUpdate(savedBookmarks);
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
    setAvailableTags(tags);
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.every(tag => bookmark.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const pinnedBookmarks = filteredBookmarks.filter(b => b.isPinned);
  const unpinnedBookmarks = filteredBookmarks.filter(b => !b.isPinned);

  return (
    <main className="min-h-screen bg-dark p-2">
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

        <BookmarkList
          pinnedBookmarks={pinnedBookmarks}
          unpinnedBookmarks={unpinnedBookmarks}
          viewMode={viewMode}
          onTogglePin={handleTogglePin}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
          />
        )}
      </div>
    </main>
  );
}
