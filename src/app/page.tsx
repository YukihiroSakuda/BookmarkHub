'use client';

import { useState, useEffect } from 'react';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkHeader } from '@/components/BookmarkHeader';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import { Bookmark, SortOption, SortOrder } from '@/types/bookmark';
import { useImportBookmarks } from '@/components/ImportBookmarks';
import { BookmarkForm } from '@/components/BookmarkForm';
import { SortControls } from '@/components/SortControls';

export default function Home() {
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
    // 既存のブックマークからタグを抽出
    const tags = new Set<string>();
    savedBookmarks.forEach(bookmark => {
      if (bookmark && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
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
    // 削除されたタグを特定
    const removedTags = availableTags.filter(tag => !tags.includes(tag));
    
    // 名前が変更されたタグを特定
    const renamedTags = new Map<string, string>();
    const newTags = tags.filter(tag => !availableTags.includes(tag));
    
    // 新しいタグと古いタグの対応を設定
    if (newTags.length === 1 && removedTags.length === 1) {
      // 1つのタグが変更された場合
      renamedTags.set(removedTags[0], newTags[0]);
      
      // フィルタリング状態を更新
      setSelectedTags(prev => 
        prev.map(tag => renamedTags.get(tag) || tag)
      );
    }
    
    // タグが削除された場合、選択中のタグからも削除
    if (removedTags.length > 0) {
      setSelectedTags(prev => 
        prev.filter(tag => !removedTags.includes(tag))
      );
    }
    
    // 既存のブックマークを更新
    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags
        .filter(tag => !removedTags.includes(tag) || renamedTags.has(tag)) // 削除されたタグを除去（名前変更されたタグは保持）
        .map(tag => renamedTags.get(tag) || tag) // 名前が変更されたタグを更新
    }));
    
    // ブックマークを更新
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
          onTagClick={handleTagClick}
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
  );
}
