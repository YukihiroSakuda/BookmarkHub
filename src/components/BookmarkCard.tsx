import { Bookmark } from '@/types/bookmark';
import { Pin, SquarePen, Trash2 } from 'lucide-react';
import { Tag } from './Tag';
import { Button } from './Button';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export function BookmarkCard({ 
  bookmark, 
  viewMode, 
  onTogglePin, 
  onEdit, 
  onDelete 
}: BookmarkCardProps) {
  return (
    <div className={`bg-dark-lighter/50 backdrop-blur-sm rounded-xl border border-energy-purple/30 shadow-lg hover:shadow-neon transition-all duration-300 ${
      viewMode === 'list' 
        ? 'flex items-center justify-between p-4' 
        : 'flex flex-col p-4'
    }`}>
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
            {bookmark.tags.map((tag) => (
              <Tag key={tag} tag={tag} isSelected={true} />
            ))}
          </div>
        </div>
      </a>
      <div className={`flex items-center justify-end space-x-2 ${
        viewMode === 'list' 
          ? '' 
          : 'mt-3 pt-3 border-t border-energy-purple/20 bg-dark/30 -mx-4 -mb-4 px-4 py-3 rounded-b-xl'
      }`}>
        <Button
          onClick={() => onTogglePin(bookmark.id)}
          variant="secondary"
          size="sm"
          icon={Pin}
          isActive={bookmark.isPinned}
        />
        <Button
          onClick={() => onEdit(bookmark)}
          variant="secondary"
          size="sm"
          icon={SquarePen}
        />
        <Button
          onClick={() => onDelete(bookmark.id)}
          variant="secondary"
          size="sm"
          icon={Trash2}
        />
      </div>
    </div>
  );
} 