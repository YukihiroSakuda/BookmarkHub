import { Bookmark } from '@/types/bookmark';
import { Grid, List, Plus, Search, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { TagManager } from './TagManager';
import { Tag as TagComponent } from './Tag';
import { Button } from './Button';

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
}

export function BookmarkHeader({
  viewMode,
  onViewModeChange,
  selectedTags,
  setSelectedTags,
  onAddBookmark,
  onTagManagerOpen,
  pinnedCount,
  totalCount,
  searchQuery,
  onSearchChange,
  availableTags,
  onTagClick,
  onUpdateTags,
}: BookmarkHeaderProps) {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  const clearAll = () => {
    setSelectedTags([]);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-4">
        <h1 className="text-4xl font-bold bg-gradient-energy bg-clip-text text-transparent animate-gradient-x tracking-tight">NeonBookmark</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 pl-8 rounded-xl border border-energy-purple/30 bg-dark-lighter/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent text-base transition-all duration-300"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-energy-purple/70" size={16} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
              variant="secondary"
              size="md"
              icon={viewMode === 'grid' ? List : Grid}
            />
            <Button
              onClick={onAddBookmark}
              variant="primary"
              size="lg"
              icon={Plus}
            >
              Add New
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
                  onClick={clearAll}
                  variant="ghost"
                  size="sm"
                  icon={X}
                >
                  Clear all
                </Button>
              )}
              <Button
                onClick={() => setIsTagManagerOpen(true)}
                variant="ghost"
                size="sm"
                icon={Tag}
              >
                Manage Tags
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