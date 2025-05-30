import { SquarePen, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface TagManagerProps {
  availableTags: string[];
  onClose: () => void;
  onUpdateTagName: (oldName: string, newName: string) => Promise<void>;
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
}

export function TagManager({ 
  availableTags, 
  onClose, 
  onUpdateTagName,
  onAddTag,
  onRemoveTag 
}: TagManagerProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setTags([...availableTags]);
  }, [availableTags]);

  const handleAddTag = async () => {
    const normalizedTag = newTag.trim();
    if (!normalizedTag) {
      console.log('Tag is empty after trimming');
      return;
    }

    const isDuplicate = tags.some(tag => 
      tag.toLowerCase() === normalizedTag.toLowerCase()
    );
    
    if (!isDuplicate) {
      try {
        await onAddTag(normalizedTag);
        setTags([...tags, normalizedTag]);
        setNewTag('');
      } catch (error) {
        console.error('Error adding tag:', error);
        alert('タグの追加中にエラーが発生しました。');
      }
    } else {
      console.log('Tag not added - duplicate or empty');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tagToRemove}"?`)) {
      try {
        await onRemoveTag(tagToRemove);
        setTags(tags.filter(tag => tag !== tagToRemove));
      } catch (error) {
        console.error('Error removing tag:', error);
        alert('タグの削除中にエラーが発生しました。');
      }
    }
  };

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleSaveEdit = async () => {
    const normalizedEditValue = editValue.trim();
    if (editingTag && normalizedEditValue) {
      const isDuplicate = tags.some(tag => 
        tag !== editingTag && tag.toLowerCase() === normalizedEditValue.toLowerCase()
      );
      
      if (!isDuplicate) {
        try {
          await onUpdateTagName(editingTag, normalizedEditValue);
          setTags(tags.map(tag => tag === editingTag ? normalizedEditValue : tag));
          setEditingTag(null);
          setEditValue('');
        } catch (error) {
          console.error('Error updating tag:', error);
          alert('タグの更新中にエラーが発生しました。');
        }
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-2xl border border-energy-purple/30 shadow-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
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

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 