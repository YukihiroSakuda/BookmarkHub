'use client';

import { Bookmark, DEFAULT_TAGS } from '@/types/bookmark';
import { BookmarkForm } from '@/components/BookmarkForm';
import { BookmarkHeader } from '@/components/BookmarkHeader';
import { BookmarkList } from '@/components/BookmarkList';
import { useState, useEffect } from 'react';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import { Button } from '@/components/Button';
import { TagManager } from '../components/TagManager';

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([...DEFAULT_TAGS]);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  useEffect(() => {
    const savedBookmarks = getBookmarks();
    setBookmarks(savedBookmarks);
    
    // 全ブックマークからユニークなタグを抽出
    const uniqueTags = new Set<string>([
      ...DEFAULT_TAGS,
      ...savedBookmarks.flatMap(bookmark => bookmark.tags)
    ]);
    setAvailableTags(Array.from(uniqueTags).sort());
  }, []);

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormOpen(true);
  };

  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id'>) => {
    let updatedBookmarks: Bookmark[];
    if (editingBookmark) {
      updatedBookmarks = bookmarks.map(b => 
        b.id === editingBookmark.id ? { ...b, ...bookmarkData } : b
      );
    } else {
      const newBookmark: Bookmark = {
        ...bookmarkData,
        id: crypto.randomUUID(),
      };
      updatedBookmarks = [...bookmarks, newBookmark];
    }
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);

    // タグの更新
    const uniqueTags = new Set<string>([
      ...DEFAULT_TAGS,
      ...updatedBookmarks.flatMap(bookmark => bookmark.tags)
    ]);
    setAvailableTags(Array.from(uniqueTags).sort());

    // モーダルを閉じる
    setIsFormOpen(false);
    setIsAddBookmarkOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    const bookmarkToDelete = bookmarks.find(b => b.id === id);
    if (bookmarkToDelete && window.confirm("Are you sure you want to delete this bookmark?")) {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      setBookmarks(updatedBookmarks);
      saveBookmarks(updatedBookmarks);
    }
  };

  const handleTogglePin = (id: string) => {
    const updatedBookmarks = bookmarks.map(b => 
      b.id === id ? { ...b, isPinned: !b.isPinned } : b
    );
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearAll = () => {
    setSelectedTags([]);
  };

  const handleUpdateTags = (newTags: string[]) => {
    setAvailableTags(newTags);
    // ブックマークのタグを更新
    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags.filter(tag => newTags.includes(tag))
    }));
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      bookmark.title.toLowerCase().includes(searchLower) ||
      bookmark.url.toLowerCase().includes(searchLower) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => bookmark.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const pinnedBookmarks = filteredBookmarks.filter(b => b.isPinned);
  const unpinnedBookmarks = filteredBookmarks.filter(b => !b.isPinned);

  return (
    <main className="min-h-screen p-1 md:p-2 bg-gradient-dark text-white">
      <div className="w-full max-w-[1920px] mx-auto px-2 md:px-4">
        <BookmarkHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedTags={selectedTags}
          onAddBookmark={() => setIsAddBookmarkOpen(true)}
          onClearAll={handleClearAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          availableTags={availableTags}
          onTagClick={handleTagClick}
          onUpdateTags={handleUpdateTags}
        />

        {/* フィルタリングされたブックマークとピン留めされたブックマークを表示 */}
        {filteredBookmarks.length > 0 ? (
          <BookmarkList
            pinnedBookmarks={pinnedBookmarks}
            unpinnedBookmarks={unpinnedBookmarks}
            viewMode={viewMode}
            onTogglePin={handleTogglePin}
            onEdit={handleEditBookmark}
            onDelete={handleDeleteBookmark}
          />
        ) : (
          /* ブックマークが検索条件に一致しない場合 */
          bookmarks.length > 0 && (
            <div className="text-center py-12 text-white/60">
              <p>No bookmarks match your search. Try different keywords or tags!</p>
            </div>
          )
        )}

        {/* ブックマークが空の場合 */}
        {bookmarks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">Let&apos;s add your first bookmark!</p>
            <Button
              onClick={() => setIsAddBookmarkOpen(true)}
              variant="primary"
              size="lg"
              className="mt-4"
            >
              Add your first bookmark
            </Button>
          </div>
        )}

        {/* フォーム */}
        {isAddBookmarkOpen && (
          <BookmarkForm
            onClose={() => setIsAddBookmarkOpen(false)}
            onSave={handleSaveBookmark}
            availableTags={availableTags}
          />
        )}

        {/* 編集フォーム */}
        {isFormOpen && (
          <BookmarkForm
            bookmark={editingBookmark}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveBookmark}
            availableTags={availableTags}
          />
        )}

        {isTagManagerOpen && (
          <TagManager
            availableTags={availableTags}
            onClose={() => setIsTagManagerOpen(false)}
            onUpdateTags={handleUpdateTags}
          />
        )}
      </div>
    </main>
  );
}
