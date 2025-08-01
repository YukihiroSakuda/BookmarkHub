import { BookmarkUI } from '@/types/bookmark';
import { Trash2, Pin, SquarePen, Globe } from 'lucide-react';
import { Button } from './Button';
import { Tag } from './Tag';
import { useState, memo, useCallback, useMemo } from 'react';
import Image from 'next/image';

interface BookmarkCardProps {
  bookmark: BookmarkUI;
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: BookmarkUI) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const BookmarkCard = memo(function BookmarkCard({ 
  bookmark, 
  viewMode, 
  onTogglePin, 
  onEdit, 
  onDelete,
  onClick
}: BookmarkCardProps) {
  const getFaviconUrl = useCallback((url: string) => {
    try {
      const urlObj = new URL(url);
      // 内部ネットワークのURLや特殊なドメインの場合は空文字を返す
      if (urlObj.hostname.includes('.kmt.') || 
          urlObj.hostname.includes('.komatsu.') ||
          urlObj.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) ||
          urlObj.hostname.includes('.local') ||
          urlObj.hostname.includes('.internal')) {
        return '';
      }
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return '';
    }
  }, []);

  const sortedTags = useMemo(() => 
    bookmark.tags.sort((a, b) => a.localeCompare(b)), 
    [bookmark.tags]
  );

  const faviconUrl = useMemo(() => getFaviconUrl(bookmark.url), [bookmark.url, getFaviconUrl]);

  const FaviconDisplay = memo(function FaviconDisplay({ url }: { url: string }) {
    const [showFallback, setShowFallback] = useState(false);

    const handleError = useCallback(() => setShowFallback(true), []);

    if (!url || showFallback) {
      return <Globe className="size-4 text-black dark:text-white" />;
    }

    return (
      <div className="relative size-4">
        <Image
          src={url}
          alt=""
          width={16}
          height={16}
          className="rounded-sm"
          onError={handleError}
        />
      </div>
    );
  });

  return (
    <div
      className={`backdrop-blur-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-600 shadow-sm hover:bg-blue-50 dark:hover:bg-neutral-800 ${
        viewMode === 'list' 
          ? 'flex items-center justify-between p-2' 
          : 'flex flex-col p-4'
      }`}
    >
      {viewMode === 'list' ? (
        // List View Layout
        <div className="flex items-center flex-1 min-w-0 gap-2">
          <FaviconDisplay url={faviconUrl} />
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 overflow-hidden cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <h3 className="font-medium text-sm truncate">
              {bookmark.title}
            </h3>
          </a>
          <div className="flex items-center flex-wrap gap-1.5 overflow-hidden">
            {sortedTags.map((tag) => (
              <Tag key={tag} tag={tag} isSelected={true} />
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(bookmark.id);
              }}
              variant="ghost"
              size="sm"
              icon={Pin}
              isActive={bookmark.isPinned}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              variant="ghost"
              size="sm"
              icon={SquarePen}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this bookmark?')) {
                  onDelete(bookmark.id);
                }
              }}
              variant="ghost"
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
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FaviconDisplay url={faviconUrl} />
              <h3 className="font-medium text-energy-green text-sm truncate">
                {bookmark.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sortedTags.map((tag) => (
                <Tag key={tag} tag={tag} isSelected={true} />
              ))}
            </div>
          </a>
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(bookmark.id);
              }}
              variant="ghost"
              size="sm"
              icon={Pin}
              isActive={bookmark.isPinned}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              variant="ghost"
              size="sm"
              icon={SquarePen}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this bookmark?')) {
                  onDelete(bookmark.id);
                }
              }}
              variant="ghost"
              size="sm"
              icon={Trash2}
            />
          </div>
        </>
      )}
    </div>
  );
});

export { BookmarkCard }; 