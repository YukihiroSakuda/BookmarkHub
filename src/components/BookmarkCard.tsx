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
  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return '/default-favicon.png';
    }
  };

  return (
    <div className={`bg-dark-lighter/50 backdrop-blur-sm rounded-xl border border-energy-purple/30 shadow-lg hover:shadow-neon transition-all duration-300 ${
      viewMode === 'list' 
        ? 'flex items-center justify-between p-4' 
        : 'flex flex-col p-4'
    }`}>
      {viewMode === 'list' ? (
        // List View Layout
        <div className="flex items-center flex-1 min-w-0 gap-4">
          <img
            src={getFaviconUrl(bookmark.url)}
            alt={`${bookmark.title} favicon`}
            className="w-6 h-6 rounded-sm object-contain bg-dark-lighter/30 p-0.5"
            onError={(e) => {
              e.currentTarget.src = '/default-favicon.png';
            }}
          />
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 overflow-hidden cursor-pointer"
          >
            <h3 className="font-medium text-energy-green text-sm truncate">
              {bookmark.title}
            </h3>
          </a>
          <div className="flex items-center flex-wrap gap-1.5 overflow-hidden">
            {bookmark.tags.map((tag) => (
              <Tag key={tag} tag={tag} isSelected={true} />
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2">
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
      ) : (
        // Grid View Layout
        <>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <img
                src={getFaviconUrl(bookmark.url)}
                alt={`${bookmark.title} favicon`}
                className="w-6 h-6 rounded-sm object-contain bg-dark-lighter/30 p-0.5"
                onError={(e) => {
                  e.currentTarget.src = '/default-favicon.png';
                }}
              />
              <h3 className="font-medium text-energy-green text-sm truncate">
                {bookmark.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {bookmark.tags.map((tag) => (
                <Tag key={tag} tag={tag} isSelected={true} />
              ))}
            </div>
          </a>
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-energy-purple/20 bg-dark/30 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
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
        </>
      )}
    </div>
  );
} 