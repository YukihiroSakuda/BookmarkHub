'use client';

import { useState, useEffect } from 'react';
import { Bookmark, DEFAULT_TAGS } from '@/types/bookmark';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import BookmarkModal from '@/components/modals/BookmarkModal';
import { Plus, Grid, List, Search, Trash2, X, Tag, SquarePen, Pin } from 'lucide-react';

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([...DEFAULT_TAGS]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string>('');
  const [newTagName, setNewTagName] = useState('');

  // サイケなグラデーションクラス配列を用意
  const tagGradients = [
    'bg-gradient-energy-green text-white',
    'bg-gradient-energy-purple text-white',
    'bg-gradient-energy-pink text-white',
  ];

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

  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id'>) => {
    let updatedBookmarks: Bookmark[];
    if (editingBookmark) {
      updatedBookmarks = bookmarks.map(b => 
        b.id === editingBookmark.id ? { ...b, ...bookmarkData } : b
      );
    } else {
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        ...bookmarkData,
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

    setIsModalOpen(false);
    setEditingBookmark(undefined);
  };

  const handleDeleteBookmark = (id: string) => {
    if (window.confirm('このブックマークを削除してもよろしいですか？')) {
      const updatedBookmarks = bookmarks.filter(b => b.id !== id);
      setBookmarks(updatedBookmarks);
      saveBookmarks(updatedBookmarks);

      // タグの更新
      const uniqueTags = new Set<string>([
        ...DEFAULT_TAGS,
        ...updatedBookmarks.flatMap(bookmark => bookmark.tags)
      ]);
      setAvailableTags(Array.from(uniqueTags).sort());
    }
  };

  const handleTogglePin = (id: string) => {
    const updatedBookmarks = bookmarks.map(b => 
      b.id === id ? { ...b, isPinned: !b.isPinned } : b
    );
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEditTag = (oldTag: string) => {
    setEditingTag(oldTag);
    setNewTagName(oldTag);
    setIsTagModalOpen(true);
  };

  const handleSaveTag = () => {
    if (!newTagName.trim()) return;

    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags.map(tag => tag === editingTag ? newTagName : tag)
    }));

    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);

    const uniqueTags = new Set<string>([
      ...DEFAULT_TAGS,
      ...updatedBookmarks.flatMap(bookmark => bookmark.tags)
    ]);
    setAvailableTags(Array.from(uniqueTags).sort());

    setIsTagModalOpen(false);
    setEditingTag('');
    setNewTagName('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    if (window.confirm(`タグ "${tagToDelete}" を削除してもよろしいですか？\nこのタグを使用しているブックマークからも削除されます。`)) {
      const updatedBookmarks = bookmarks.map(bookmark => ({
        ...bookmark,
        tags: bookmark.tags.filter(tag => tag !== tagToDelete)
      }));

      setBookmarks(updatedBookmarks);
      saveBookmarks(updatedBookmarks);

      const uniqueTags = new Set<string>([
        ...DEFAULT_TAGS,
        ...updatedBookmarks.flatMap(bookmark => bookmark.tags)
      ]);
      setAvailableTags(Array.from(uniqueTags).sort());
    }
  };

  const handleAddNewTag = (tag: string) => {
    const uniqueTags = new Set<string>([
      ...DEFAULT_TAGS,
      ...bookmarks.flatMap(bookmark => bookmark.tags),
      tag
    ]);
    setAvailableTags(Array.from(uniqueTags).sort());
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
        <div className="flex flex-col items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-energy bg-clip-text text-transparent animate-gradient-x tracking-tight">NeonBookmark</h1>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-8 rounded-xl border border-energy-purple/30 bg-dark-lighter/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent text-base transition-all duration-300"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-energy-purple/70" size={16} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-xl text-white/90 hover:bg-gradient-energy-green hover:text-white transition-all duration-300 border border-energy-purple/30 hover:shadow-neon-green"
                aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-energy text-white rounded-xl hover:shadow-neon-green transition-all duration-300 text-base font-medium"
              >
                <Plus size={18} />
                <span>Add New</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-dark-lighter/50 backdrop-blur-sm p-3 rounded-2xl border border-energy-purple/30 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold bg-gradient-energy-green bg-clip-text text-transparent tracking-tight">Filter by Tags</h2>
                {selectedTags.length > 0 && (
                  <span className="text-xs text-energy-pink/80">
                    ({selectedTags.length} selected)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-white/90 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gradient-energy-green transition-all duration-300"
                  >
                    <X size={12} />
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsTagModalOpen(true)}
                  className="text-xs text-white/90 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gradient-energy-green transition-all duration-300"
                >
                  <Tag size={12} />
                  Manage Tags
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-energy text-white shadow-neon'
                      : 'bg-dark/50 text-white/90 hover:bg-gradient-energy-purple hover:text-white border border-energy-purple/30 hover:shadow-neon'
                  }`}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X size={12} className="ml-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(pinnedBookmarks.length > 0 || unpinnedBookmarks.length > 0) && (
          <div className="mb-4">
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2"
              : "flex flex-col space-y-2"
            }>
              {pinnedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`bg-dark-lighter/50 backdrop-blur-sm rounded-xl border border-energy-purple/30 shadow-lg hover:shadow-neon transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'flex items-center justify-between p-4' 
                      : 'flex flex-col p-4'
                  }`}
                >
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 min-w-0 ${viewMode === 'list' ? 'mr-4' : ''} cursor-pointer`}
                  >
                    <div>
                      <h3 className={`font-medium text-energy-green ${
                        viewMode === 'grid' 
                          ? 'text-sm truncate' 
                          : 'text-sm truncate mb-1'
                      }`}>{bookmark.title}</h3>
                      <div className={`flex flex-wrap gap-1.5 ${viewMode === 'grid' ? 'mt-2' : 'mt-1'}`}>
                        {bookmark.tags.map((tag, i) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded-lg text-xs font-semibold bg-clip-padding ${tagGradients[Math.abs(tag.charCodeAt(0) + i) % tagGradients.length]}`}
                            style={{backgroundSize: '200% 200%', backgroundPosition: 'left center'}}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                  <div className={`flex items-center justify-end space-x-2 ${
                    viewMode === 'list' 
                      ? '' 
                      : 'mt-3 pt-3 border-t border-energy-purple/20 bg-dark/30 -mx-4 -mb-4 px-4 py-3 rounded-b-xl'
                  }`}>
                    <button
                      onClick={() => handleTogglePin(bookmark.id)}
                      className={`p-1.5 rounded-lg transition-all duration-300 ${
                        bookmark.isPinned
                          ? 'text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy'
                          : 'text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy'
                      }`}
                      aria-label={bookmark.isPinned ? 'Unpin bookmark' : 'Pin bookmark'}
                    >
                      <Pin size={16} className={bookmark.isPinned ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => handleEditBookmark(bookmark)}
                      className="p-1.5 text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy rounded-lg transition-all duration-300"
                    >
                      <SquarePen size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="p-1.5 text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy rounded-lg transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* 区切り線 */}
            {pinnedBookmarks.length > 0 && unpinnedBookmarks.length > 0 && (
              <div className="my-4">
                <div className="w-full border-t border-energy-purple/30"></div>
              </div>
            )}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2"
              : "flex flex-col space-y-2"
            }>
              {unpinnedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`bg-dark-lighter/50 backdrop-blur-sm rounded-xl border border-energy-purple/30 shadow-lg hover:shadow-neon transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'flex items-center justify-between p-4' 
                      : 'flex flex-col p-4'
                  }`}
                >
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 min-w-0 ${viewMode === 'list' ? 'mr-4' : ''} cursor-pointer`}
                  >
                    <div>
                      <h3 className={`font-medium text-energy-green ${
                        viewMode === 'grid' 
                          ? 'text-sm truncate' 
                          : 'text-sm truncate mb-1'
                      }`}>{bookmark.title}</h3>
                      <div className={`flex flex-wrap gap-1.5 ${viewMode === 'grid' ? 'mt-2' : 'mt-1'}`}>
                        {bookmark.tags.map((tag, i) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded-lg text-xs font-semibold bg-clip-padding ${tagGradients[Math.abs(tag.charCodeAt(0) + i) % tagGradients.length]}`}
                            style={{backgroundSize: '200% 200%', backgroundPosition: 'left center'}}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                  <div className={`flex items-center justify-end space-x-2 ${
                    viewMode === 'list' 
                      ? '' 
                      : 'mt-3 pt-3 border-t border-energy-purple/20 bg-dark/30 -mx-4 -mb-4 px-4 py-3 rounded-b-xl'
                  }`}>
                    <button
                      onClick={() => handleTogglePin(bookmark.id)}
                      className={`p-1.5 rounded-lg transition-all duration-300 ${
                        bookmark.isPinned
                          ? 'text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy'
                          : 'text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy'
                      }`}
                      aria-label={bookmark.isPinned ? 'Unpin bookmark' : 'Pin bookmark'}
                    >
                      <Pin size={16} className={bookmark.isPinned ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => handleEditBookmark(bookmark)}
                      className="p-1.5 text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy rounded-lg transition-all duration-300"
                    >
                      <SquarePen size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="p-1.5 text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy rounded-lg transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isTagModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-lighter/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full border border-energy-purple/30">
              <div className="flex justify-between items-center p-4 border-b border-energy-purple/30">
                <h2 className="text-xl font-semibold bg-gradient-energy-green bg-clip-text text-transparent tracking-tight">Manage Tags</h2>
                <button
                  onClick={() => {
                    setIsTagModalOpen(false);
                    setEditingTag('');
                    setNewTagName('');
                  }}
                  className="text-energy-pink/80 hover:text-white transition-colors duration-300"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-white/90">{tag}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="p-1.5 text-energy-green/80 hover:text-white bg-dark/50 hover:bg-gradient-energy-green rounded-lg transition-all duration-300"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="p-1.5 text-energy-pink/80 hover:text-white bg-dark/50 hover:bg-gradient-energy-pink rounded-lg transition-all duration-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {editingTag && (
                  <div className="mt-4 p-4 bg-dark/50 rounded-xl border border-energy-purple/30">
                    <h3 className="text-sm font-medium bg-gradient-energy-green bg-clip-text text-transparent mb-2">Edit Tag</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-energy-purple/30 bg-dark-lighter/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-purple/50 transition-all duration-300"
                        placeholder="New tag name"
                      />
                      <button
                        onClick={handleSaveTag}
                        className="px-4 py-2 bg-gradient-energy text-white rounded-xl hover:shadow-neon transition-all duration-300"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <BookmarkModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBookmark(undefined);
          }}
          onSave={handleSaveBookmark}
          bookmark={editingBookmark}
          availableTags={availableTags}
          onAddNewTag={handleAddNewTag}
        />
      </div>
    </main>
  );
}
