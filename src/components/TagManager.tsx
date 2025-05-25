import { SquarePen, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface TagManagerProps {
  availableTags: string[];
  onClose: () => void;
  onUpdateTags: (tags: string[]) => void;
}

export function TagManager({ availableTags, onClose, onUpdateTags }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>([...availableTags]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tagToRemove}"?`)) {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }
  };

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleSaveEdit = () => {
    if (editingTag && editValue && !tags.includes(editValue)) {
      setTags(tags.map(tag => tag === editingTag ? editValue : tag));
      setEditingTag(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  const handleSave = () => {
    onUpdateTags(tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl border border-energy-purple/30 shadow-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-energy bg-clip-text text-transparent">
            Edit Your Tags
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            icon={X}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div>
            <div className="flex gap-2 mb-4 mx-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="secondary"
                size="md"
              >
                Add
              </Button>
            </div>

            <label className="block text-sm font-medium text-white/90 mb-1">
              Your Tags
            </label>
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 bg-dark/30 rounded-lg border border-energy-purple/20"
                >
                  {editingTag === tag ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSaveEdit}
                        variant="secondary"
                        size="sm"
                      >
                        OK
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-white/90 text-sm">{tag}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleStartEdit(tag)}
                          variant="secondary"
                          size="sm"
                          icon={SquarePen}
                        />
                        <Button
                          onClick={() => handleRemoveTag(tag)}
                          variant="secondary"
                          size="sm"
                          icon={Trash2}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

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
            type="button"
            onClick={handleSave}
            variant="primary"
            size="md"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
} 