import { SquarePen, Trash2, X } from 'lucide-react';
import { useState,useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface TagManagerProps {
  availableTags: string[];
  onClose: () => void;
  onUpdateTags: (tags: string[]) => Promise<void>;
}

export function TagManager({ availableTags, onClose, onUpdateTags }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setTags([...availableTags]);
  }, [availableTags]);

  const handleAddTag = () => {
    const normalizedTag = newTag.trim();
    if (!normalizedTag) {
      console.log('Tag is empty after trimming');
      return;
    }

    const isDuplicate = tags.some(tag => 
      tag.toLowerCase() === normalizedTag.toLowerCase()
    );
    
    if (!isDuplicate) {
      setTags([...tags, normalizedTag]);
      setNewTag('');
    } else {
      console.log('Tag not added - duplicate or empty');
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
    const normalizedEditValue = editValue.trim();
    if (editingTag && normalizedEditValue) {
      const isDuplicate = tags.some(tag => 
        tag !== editingTag && tag.toLowerCase() === normalizedEditValue.toLowerCase()
      );
      
      if (!isDuplicate) {
        setTags(tags.map(tag => tag === editingTag ? normalizedEditValue : tag));
        setEditingTag(null);
        setEditValue('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  const handleSave = async () => {
    try {
      await onUpdateTags(tags);
      onClose();
    } catch (error) {
      console.error('Error saving tags:', error);
      alert('タグの保存中にエラーが発生しました。');
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-sm rounded-2xl border border-energy-purple/30 shadow-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
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
            <div className="flex gap-2 mb-4 mx-1 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="primary"
                size="md"
              >
                Add
              </Button>
            </div>

            <label className="block text-sm font-medium mb-1">
              Your Tags
            </label>
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600"
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
                        variant="secondary"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm">{tag}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleStartEdit(tag)}
                          variant="ghost"
                          size="sm"
                          icon={SquarePen}
                        />
                        <Button
                          onClick={() => handleRemoveTag(tag)}
                          variant="ghost"
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
            variant="secondary"
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