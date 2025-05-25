import { Bookmark } from '@/types/bookmark';
import { ExternalLink, Trash2, Edit2, Pin, SquarePen, Globe } from 'lucide-react';
import { Button } from './Button';
import { Tag } from './Tag';
import { useState } from 'react';
import Image from 'next/image';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: 'list' | 'grid';
  onTogglePin: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function BookmarkCard({ 
  bookmark, 
  viewMode, 
  onTogglePin, 
  onEdit, 
  onDelete,
  onClick
}: BookmarkCardProps) {
  const getFaviconUrl = (url: string) => {
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
  };

  function FaviconDisplay({ url }: { url: string }) {
    const [showFallback, setShowFallback] = useState(false);

    if (!url || showFallback) {
      return <Globe className="w-4 h-4 text-energy-purple/70" />;
    }

    return (
      <div className="relative w-4 h-4">
        <Image
          src={url}
          alt=""
          width={16}
          height={16}
          className="rounded-sm"
          onError={() => setShowFallback(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-dark-lighter/50 backdrop-blur-sm rounded-xl border border-energy-purple/30 shadow-lg hover:shadow-neon transition-all duration-300 ${
        viewMode === 'list' 
          ? 'flex items-center justify-between p-4' 
          : 'flex flex-col p-4'
      }`}
    >
      {viewMode === 'list' ? (
        // List View Layout
        <div className="flex items-center flex-1 min-w-0 gap-4">
          <FaviconDisplay url={getFaviconUrl(bookmark.url)} />
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
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(bookmark.id);
              }}
              variant="secondary"
              size="sm"
              icon={Pin}
              isActive={bookmark.isPinned}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              variant="secondary"
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
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FaviconDisplay url={getFaviconUrl(bookmark.url)} />
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
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(bookmark.id);
              }}
              variant="secondary"
              size="sm"
              icon={Pin}
              isActive={bookmark.isPinned}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              variant="secondary"
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