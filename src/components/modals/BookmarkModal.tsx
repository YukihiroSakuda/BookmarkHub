'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from '@/types/bookmark';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { X } from 'lucide-react';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<Bookmark, 'id'>) => void;
  bookmark?: Bookmark;
  availableTags: string[];
  onAddNewTag?: (tag: string) => void;
}

export default function BookmarkModal({
  isOpen,
  onClose,
  onSave,
  bookmark,
  availableTags: initialAvailableTags,
  onAddNewTag,
}: BookmarkModalProps) {
  const [title, setTitle] = useState(bookmark?.title || '');
  const [url, setUrl] = useState(bookmark?.url || '');
  const [tags, setTags] = useState<string[]>(bookmark?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(initialAvailableTags);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setTags(bookmark.tags);
    } else {
      setTitle('');
      setUrl('');
      setTags([]);
      setNewTag('');
    }
  }, [bookmark, isOpen]);

  useEffect(() => {
    setAvailableTags(initialAvailableTags);
  }, [initialAvailableTags]);

  const handleAddTag = (tagToAdd?: string) => {
    const tag = tagToAdd || newTag;
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setNewTag('');
      if (!availableTags.includes(tag.trim())) {
        setAvailableTags([...availableTags, tag.trim()].sort());
        onAddNewTag?.(tag.trim());
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagClick = (tag: string) => {
    setTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSave({
      title,
      url,
      tags,
      isPinned: bookmark?.isPinned || false,
      createdAt: bookmark?.createdAt || now,
      updatedAt: now,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-lighter/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full border border-energy-purple/30">
        <div className="flex justify-between items-center p-4 border-b border-energy-purple/30">
          <h2 className="text-xl font-semibold bg-gradient-energy-green bg-clip-text text-transparent tracking-tight">
            {bookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            onClick={onClose}
            className="text-energy-pink/80 hover:text-white transition-colors duration-300"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/90 mb-1">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-energy-purple/30 bg-dark-lighter/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-white/90 mb-1">URL</label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-energy-purple/30 bg-dark-lighter/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                      tags.includes(tag)
                        ? 'bg-gradient-energy text-white shadow-neon'
                        : 'bg-dark/50 text-white/90 hover:bg-gradient-energy-purple hover:text-white border border-energy-purple/30 hover:shadow-neon'
                    }`}
                  >
                    {tag}
                    {tags.includes(tag) && (
                      <X size={12} className="ml-0.5" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-4 py-2 border border-energy-purple/30 bg-dark-lighter/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-green/50 focus:border-transparent transition-all duration-300"
                  placeholder="Add new tag (press Enter)"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-4 py-2 bg-gradient-energy text-white rounded-xl hover:shadow-neon transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white/90 hover:text-white bg-dark/50 hover:bg-gradient-energy-pink rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-energy text-white rounded-xl hover:shadow-neon transition-all duration-300"
              >
                {bookmark ? 'Save Changes' : 'Add Bookmark'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 