import { Bookmark } from '@/types/bookmark';
import { X, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { Tag } from './Tag';
import { Input } from './Input';

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onClose: () => void;
  onSave: (bookmarkData: Omit<Bookmark, 'id'>) => void;
  availableTags: string[];
}

export function BookmarkForm({ bookmark, onClose, onSave, availableTags }: BookmarkFormProps) {
  const [title, setTitle] = useState(bookmark?.title || '');
  const [url, setUrl] = useState(bookmark?.url || '');
  const [tags, setTags] = useState<string[]>(bookmark?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      url,
      tags,
      isPinned: bookmark?.isPinned || false,
      createdAt: bookmark?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: bookmark?.accessCount || 0,
      lastAccessedAt: bookmark?.lastAccessedAt,
    });
  };

  const handleTagClick = (tag: string) => {
    setTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl border border-energy-purple/30 shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-energy bg-clip-text text-transparent">
            {bookmark ? 'Edit Your Bookmark' : 'Add New Bookmark'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            icon={X}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            id="url"
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <Tag
                  key={tag}
                  tag={tag}
                  isSelected={tags.includes(tag)}
                  onClick={() => handleTagClick(tag)}
                />
              ))}
            </div>
          </div>

          {bookmark && (
            <div className="space-y-2 pt-2 border-t border-energy-purple/20">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <TrendingUp size={16} />
                <span>Access Count: {bookmark.accessCount || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock size={16} />
                <span>Created: {formatDate(bookmark.createdAt)}</span>
              </div>
              {bookmark.lastAccessedAt && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock size={16} />
                  <span>Last Accessed: {formatDate(bookmark.lastAccessedAt)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              {bookmark ? 'Save Changes' : 'Add Bookmark'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 