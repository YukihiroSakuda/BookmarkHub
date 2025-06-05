import { BookmarkUI } from "@/types/bookmark";
import { X, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Input } from "./Input";

interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BookmarkFormProps {
  bookmark?: BookmarkUI;
  onClose: () => void;
  onSave: (bookmarkData: Omit<BookmarkUI, "id">) => void;
  availableTags: Tag[];
  onUpdateTags: (tags: string[]) => void;
}

export function BookmarkForm({
  bookmark,
  onClose,
  onSave,
  availableTags,
  onUpdateTags,
}: BookmarkFormProps) {
  const [title, setTitle] = useState(bookmark?.title || "");
  const [url, setUrl] = useState(bookmark?.url || "");
  const [tags, setTags] = useState<string[]>(bookmark?.tags || []);
  const [newTag, setNewTag] = useState("");

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
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      if (!availableTags.some((t) => t.name === tag)) {
        onUpdateTags([...availableTags.map((t) => t.name), tag]);
      }
    }
    setNewTag("");
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-2xl border shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="text-blue-500">#</span>
            {bookmark ? "Edit Your Bookmark" : "Add New Bookmark"}
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" icon={X} />
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
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => handleAddTag(newTag)}
                variant="primary"
                size="md"
              >
                Add
              </Button>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">
                Available Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <Tag
                    key={tag.id}
                    tag={tag.name}
                    isSelected={tags.includes(tag.name)}
                    onClick={() => handleTagClick(tag.name)}
                  />
                ))}
              </div>
            </div>
          </div>

          {bookmark && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                <span>Access Count: {bookmark.accessCount || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span>Created: {formatDate(bookmark.createdAt)}</span>
              </div>
              {bookmark.lastAccessedAt && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock size={16} />
                  <span>
                    Last Accessed: {formatDate(bookmark.lastAccessedAt)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {bookmark ? "Save Changes" : "Add Bookmark"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
