import { Grid, List, Plus, Search, Tag, X, Upload, Download, MoreVertical, Trash2, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TagManager } from './TagManager';
import { Tag as TagComponent } from './Tag';
import { Button } from './Button';
import { useImportBookmarks } from './ImportBookmarks';
import { BookmarkUI, convertToUI } from '@/types/bookmark';
import { exportBookmarksToHtml, downloadHtml } from '@/utils/export';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface BookmarkHeaderProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  selectedTags: string[];
  onAddBookmark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: string[];
  onTagClick: (tag: string) => void;
  onClearAll: () => void;
  onBookmarksUpdate: (bookmarks: BookmarkUI[]) => void;
  bookmarks: BookmarkUI[];
}

export function BookmarkHeader({
  viewMode,
  onViewModeChange,
  selectedTags,
  onAddBookmark,
  searchQuery,
  onSearchChange,
  availableTags,
  onTagClick,
  onClearAll,
  onBookmarksUpdate,
  bookmarks,
}: BookmarkHeaderProps) {
  const router = useRouter();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ユーザー情報の取得
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();

    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const { isImporting, handleFileUpload } = useImportBookmarks({
    onImportComplete: (count) => {
      alert(`${count} bookmarks imported successfully!`);
      setIsMoreMenuOpen(false);
    },
    onBookmarksUpdate
  });

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileUpload({
          target: {
            files: target.files
          }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleExportClick = () => {
    const html = exportBookmarksToHtml(bookmarks);
    downloadHtml(html);
    setIsMoreMenuOpen(false);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all bookmarks? This action cannot be undone.')) {
      onBookmarksUpdate([]);
      setIsMoreMenuOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 my-4 px-4">
        <div className="flex items-center gap-1">
          <h1 className="text-4xl font-bold">
            Book<span className="text-blue-500">marks</span>
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto max-w-4xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Find your bookmarks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 pl-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 placeholder-neutral-400 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 focus:outline-none text-base"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                onClick={() => onSearchChange("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
              variant="secondary"
              size="lg"
              icon={viewMode === 'grid' ? List : Grid}
            />
            <div className="relative" ref={moreMenuRef}>
              <Button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                variant="secondary"
                size="lg"
                icon={MoreVertical}
              />
              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 text-neutral-400 bg-white dark:bg-black backdrop-blur-sm rounded-lg border shadow-lg py-1 z-50">
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:text-black hover:dark:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleImportClick}
                    disabled={isImporting}
                  >
                    <Upload size={16} />
                    {isImporting ? 'Importing...' : 'Import from HTML'}
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:text-black hover:dark:text-white flex items-center gap-2"
                    onClick={handleExportClick}
                  >
                    <Download size={16} />
                    Export to HTML
                  </button>
                  <div className="border-t border-energy-purple/20 my-1"></div>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-600 flex items-center gap-2"
                    onClick={handleDeleteAll}
                  >
                    <Trash2 size={16} />
                    Delete All Bookmarks
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={userMenuRef}>
              <Button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                variant="secondary"
                size="lg"
                icon={User}
              />
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 text-neutral-400 bg-white dark:bg-black backdrop-blur-sm rounded-lg border shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm border-b border-neutral-200 dark:border-neutral-700">
                    {userEmail}
                  </div>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:text-black hover:dark:text-white flex items-center gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <Button
              onClick={onAddBookmark}
              variant="primary"
              size="lg"
              icon={Plus}
            >
              Add Bookmark
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm p-3 rounded-2xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold tracking-tight">Filter by Tags</h2>
              {selectedTags.length > 0 && (
                <Button
                  onClick={onClearAll}
                  variant="ghost"
                  size="sm"
                  icon={X}
                >
                  Clear all tags
                </Button>
              )}
            </div>
            <div className="flex items-center">
              <Button
                onClick={() => {
                  console.log('Current availableTags before opening TagManager:', availableTags);
                  setIsTagManagerOpen(true);
                }}
                variant="ghost"
                size="sm"
                icon={Tag}
              >
                Edit Tags
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTags
              .sort((a, b) => a.localeCompare(b))
              .map((tag) => (
                <TagComponent
                  key={tag}
                  tag={tag}
                  onClick={() => onTagClick(tag)}
                  isSelected={selectedTags.includes(tag)}
                />
              ))}
          </div>
        </div>
      </div>

      {isTagManagerOpen && (
        <TagManager
          availableTags={availableTags}
          onClose={() => setIsTagManagerOpen(false)}
          onUpdateTagName={async (oldName, newName) => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('No active session');
              }

              // タグ名を更新
              const { error: updateError } = await supabase
                .from('tags')
                .update({ name: newName })
                .eq('user_id', session.user.id)
                .eq('name', oldName);

              if (updateError) throw updateError;

              // ブックマークのタグを更新
              const { data: bookmarks, error: bookmarksError } = await supabase
                .from('bookmarks')
                .select(`
                  *,
                  bookmarks_tags (
                    tags (
                      name
                    )
                  )
                `)
                .eq('user_id', session.user.id);
              
              if (bookmarksError) throw bookmarksError;

              // タグ情報を整形
              const formattedBookmarks = bookmarks.map(convertToUI);
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error('Error updating tag name:', error);
              alert('タグ名の更新中にエラーが発生しました。');
              throw error;
            }
          }}
          onAddTag={async (tag) => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('No active session');
              }

              // 新しいタグを追加
              const { error: insertError } = await supabase
                .from('tags')
                .insert({
                  name: tag,
                  user_id: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (insertError) throw insertError;

              // ブックマークのタグを更新
              const { data: bookmarks, error: bookmarksError } = await supabase
                .from('bookmarks')
                .select(`
                  *,
                  bookmarks_tags (
                    tags (
                      name
                    )
                  )
                `)
                .eq('user_id', session.user.id);
              
              if (bookmarksError) throw bookmarksError;

              // タグ情報を整形
              const formattedBookmarks = bookmarks.map(convertToUI);
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error('Error adding tag:', error);
              alert('タグの追加中にエラーが発生しました。');
              throw error;
            }
          }}
          onRemoveTag={async (tag) => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('No active session');
              }

              // タグを削除
              const { error: deleteError } = await supabase
                .from('tags')
                .delete()
                .eq('user_id', session.user.id)
                .eq('name', tag);

              if (deleteError) throw deleteError;

              // ブックマークのタグを更新
              const { data: bookmarks, error: bookmarksError } = await supabase
                .from('bookmarks')
                .select(`
                  *,
                  bookmarks_tags (
                    tags (
                      name
                    )
                  )
                `)
                .eq('user_id', session.user.id);
              
              if (bookmarksError) throw bookmarksError;

              // タグ情報を整形
              const formattedBookmarks = bookmarks.map(convertToUI);
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error('Error removing tag:', error);
              alert('タグの削除中にエラーが発生しました。');
              throw error;
            }
          }}
        />
      )}
    </>
  );
}