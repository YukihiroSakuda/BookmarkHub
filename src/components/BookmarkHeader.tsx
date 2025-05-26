import { Grid, List, Plus, Search, Tag, X, Upload, Download, MoreVertical, Trash2, BookHeart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TagManager } from './TagManager';
import { Tag as TagComponent } from './Tag';
import { Button } from './Button';
import { useImportBookmarks } from './ImportBookmarks';
import { Bookmark } from '@/types/bookmark';
import { exportBookmarksToHtml, downloadHtml } from '@/utils/export';

interface BookmarkHeaderProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  selectedTags: string[];
  onAddBookmark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: string[];
  onTagClick: (tag: string) => void;
  onUpdateTags: (tags: string[]) => void;
  onClearAll: () => void;
  onBookmarksUpdate: (bookmarks: Bookmark[]) => void;
  bookmarks: Bookmark[];
}

export function BookmarkHeader({
  viewMode,
  onViewModeChange,
  selectedTags,
  onAddBookmark,
  searchQuery,
  onSearchChange,
  availableTags,
  onTagClick,
  onUpdateTags,
  onClearAll,
  onBookmarksUpdate,
  bookmarks,
}: BookmarkHeaderProps) {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { isImporting, handleFileUpload } = useImportBookmarks({
    onImportComplete: (count) => {
      alert(`${count} bookmarks imported successfully!`);
      setIsMoreMenuOpen(false);
    },
    onBookmarksUpdate
  });

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileUpload({
          target: {
            files: target.files
          }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleExportClick = () => {
    const html = exportBookmarksToHtml(bookmarks);
    downloadHtml(html);
    setIsMoreMenuOpen(false);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all bookmarks? This action cannot be undone.')) {
      onBookmarksUpdate([]);
      setIsMoreMenuOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 my-4 px-4">
        <div className="flex items-center gap-1">
          <h1 className="text-4xl font-bold bg-gradient-energy bg-clip-text text-transparent animate-gradient-x tracking-tight">
            Bookmarks
          </h1>
          <BookHeart className="text-[#db2aa9]" size={32} />
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto max-w-4xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Find your bookmarks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 pl-8 rounded-xl border border-energy-purple/30 bg-dark-lighter/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent text-base transition-all duration-300"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-energy-purple/70" size={16} />
            {searchQuery && (
              <Button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-energy-purple/70 hover:text-energy-pink/80 focus:outline-none"
                onClick={() => onSearchChange("")}
                variant="ghost"
                size="sm"
                icon={X}
                aria-label="Clear search"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
              variant="secondary"
              size="lg"
              icon={viewMode === 'grid' ? List : Grid}
            />
            <div className="relative" ref={moreMenuRef}>
              <Button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                variant="secondary"
                size="lg"
                icon={MoreVertical}
                isActive={isMoreMenuOpen}
              />
              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-lighter/90 backdrop-blur-sm rounded-lg border border-energy-purple/30 shadow-lg py-1 z-50">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-energy-purple/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleImportClick}
                    disabled={isImporting}
                  >
                    <Upload size={16} />
                    {isImporting ? 'Importing...' : 'Import from HTML'}
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-energy-purple/20 flex items-center gap-2"
                    onClick={handleExportClick}
                  >
                    <Download size={16} />
                    Export to HTML
                  </button>
                  <div className="border-t border-energy-purple/20 my-1"></div>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                    onClick={handleDeleteAll}
                  >
                    <Trash2 size={16} />
                    Delete All Bookmarks
                  </button>
                </div>
              )}
            </div>
            <Button
              onClick={onAddBookmark}
              variant="primary"
              size="lg"
              icon={Plus}
            >
              Add New Bookmark
            </Button>
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
                <Button
                  onClick={onClearAll}
                  variant="ghost"
                  size="sm"
                  icon={X}
                >
                  Clear all tags
                </Button>
              )}
              <Button
                onClick={() => setIsTagManagerOpen(true)}
                variant="ghost"
                size="sm"
                icon={Tag}
              >
                Edit Tags
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <TagComponent
                key={tag}
                tag={tag}
                onClick={() => onTagClick(tag)}
                isSelected={selectedTags.includes(tag)}
              />
            ))}
          </div>
        </div>
      </div>

      {isTagManagerOpen && (
        <TagManager
          availableTags={availableTags}
          onClose={() => setIsTagManagerOpen(false)}
          onUpdateTags={onUpdateTags}
        />
      )}
    </>
  );
}