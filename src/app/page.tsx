'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkHeader } from '@/components/BookmarkHeader';
import { Bookmark, BookmarkUI, SortOption, SortOrder } from '@/types/bookmark';
import { useImportBookmarks } from '@/components/ImportBookmarks';
import { BookmarkForm } from '@/components/BookmarkForm';
import { SortControls } from '@/components/SortControls';
import LoadingScreen from './loading';
import { cn } from '@/utils/ui';
import { supabase } from '@/lib/supabaseClient';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BookmarkWithTags {
  id: string;
  title: string;
  url: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  access_count: number;
  user_id: string;
  bookmarks_tags: Array<{
    tags: {
      name: string;
    };
  }>;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkUI[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkUI | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [currentSort, setCurrentSort] = useState<SortOption>('accessCount');
  const [currentOrder, setCurrentOrder] = useState<SortOrder>('desc');

  // SupabaseのデータをUI用のデータに変換する関数
  const convertToUI = (bookmark: BookmarkWithTags): BookmarkUI => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    tags: bookmark.bookmarks_tags.map(bt => bt.tags.name),
    isPinned: bookmark.is_pinned,
    createdAt: bookmark.created_at,
    updatedAt: bookmark.updated_at,
    accessCount: bookmark.access_count,
    lastAccessedAt: undefined
  });

  // UI用のデータをSupabase用のデータに変換する関数
  const convertToDB = (bookmark: BookmarkUI, userId: string): Omit<Bookmark, 'id'> => ({
    title: bookmark.title,
    url: bookmark.url,
    is_pinned: bookmark.isPinned,
    created_at: bookmark.createdAt,
    updated_at: bookmark.updatedAt,
    access_count: bookmark.accessCount,
    user_id: userId
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth');
          return;
        }
        if (!session) {
          router.push('/auth');
          return;
        }
        setIsLoading(false);
        setTimeout(() => {
          setIsVisible(true);
        }, 300);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth');
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth');
      } else if (event === 'USER_UPDATED') {
        router.refresh();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useImportBookmarks({
    onImportComplete: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        const { data: updatedBookmarks, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', session.user.id);
        
        if (error) throw error;

        const uiBookmarks = updatedBookmarks.map(convertToUI);
        setBookmarks(uiBookmarks);
        const tags = new Set<string>();
        uiBookmarks.forEach((bookmark: BookmarkUI) => {
          bookmark.tags.forEach((tag: string) => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));
      } catch (error) {
        console.error('Error importing bookmarks:', error);
        // エラー処理を追加
      }
    }
  });

  const handleBookmarksUpdate = async (updatedBookmarks: BookmarkUI[]) => {
    setBookmarks(updatedBookmarks);
    // ブックマークに紐づいているタグのみをフィルター用に設定
    const tags = new Set<string>();
    updatedBookmarks.forEach((bookmark: BookmarkUI) => {
      if (bookmark && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    setFilterTags(Array.from(tags));
  };

  // タグを取得する関数
  const fetchTags = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
  
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (tagsError) throw tagsError;
  
      console.log('Fetched tags:', tags);
      const tagNames = tags.map((tag: Tag) => tag.name);
      setAvailableTags(tagNames); // すべてのタグを設定
      return tagNames;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchBookmarksAndTags = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // タグを取得
        await fetchTags();

        // ブックマークを取得
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
        handleBookmarksUpdate(formattedBookmarks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchBookmarksAndTags();
  }, []);

  const handleSave = async (bookmarkData: Omit<BookmarkUI, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const bookmarkToSave = convertToDB(
        { id: selectedBookmark?.id || '', ...bookmarkData },
        session.user.id
      );

      let bookmarkId: string;

      if (selectedBookmark) {
        const { error } = await supabase
          .from('bookmarks')
          .update(bookmarkToSave)
          .eq('id', selectedBookmark.id)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        bookmarkId = selectedBookmark.id;
      } else {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([bookmarkToSave])
          .select('id')
          .single();
        
        if (error) throw error;
        bookmarkId = data.id;
      }

      // タグの保存
      if (bookmarkData.tags.length > 0) {
        // 既存のタグを取得
        const { data: existingTags, error: tagsError } = await supabase
          .from('tags')
          .select('id, name')
          .eq('user_id', session.user.id)
          .in('name', bookmarkData.tags);
        
        if (tagsError) throw tagsError;

        // 新しいタグを作成
        const newTags = bookmarkData.tags.filter(
          tag => !existingTags.some(et => et.name === tag)
        );

        if (newTags.length > 0) {
          const { data: insertedTags, error: insertError } = await supabase
            .from('tags')
            .insert(
              newTags.map(name => ({
                name,
                user_id: session.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }))
            )
            .select('id, name');
          
          if (insertError) throw insertError;
          existingTags.push(...insertedTags);
        }

        // 既存のbookmarks_tagsを削除
        const { error: deleteError } = await supabase
          .from('bookmarks_tags')
          .delete()
          .eq('bookmark_id', bookmarkId);
        
        if (deleteError) throw deleteError;

        // 新しいbookmarks_tagsを作成
        const { error: insertError } = await supabase
          .from('bookmarks_tags')
          .insert(
            existingTags.map(tag => ({
              bookmark_id: bookmarkId,
              tag_id: tag.id,
              created_at: new Date().toISOString()
            }))
          );
        
        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      setSelectedBookmark(undefined);

      // タグ一覧を更新
      await fetchTags();

      // ブックマーク一覧を再取得
      const { data: updatedBookmarks, error: fetchError } = await supabase
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
      
      if (fetchError) throw fetchError;

      // タグ情報を整形
      const formattedBookmarks = updatedBookmarks.map(convertToUI);

      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const handleEdit = (bookmark: BookmarkUI) => {
    setSelectedBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;

      // ブックマークを再取得（タグ情報を含む）
      const { data: updatedBookmarks, error: fetchError } = await supabase
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
      
      if (fetchError) throw fetchError;

      // タグ情報を整形
      const formattedBookmarks = updatedBookmarks.map(convertToUI);
      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('ブックマークの削除中にエラーが発生しました。');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) return;

      const { error } = await supabase
        .from('bookmarks')
        .update({ is_pinned: !bookmark.isPinned })
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;

      // ブックマークを再取得（タグ情報を含む）
      const { data: updatedBookmarks, error: fetchError } = await supabase
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
      
      if (fetchError) throw fetchError;

      // タグ情報を整形
      const formattedBookmarks = updatedBookmarks.map(convertToUI);
      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('ブックマークのピン状態の更新中にエラーが発生しました。');
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpdateTags = async (tags: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // タグの正規化
      const normalizedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);

      // 既存のタグを取得
      const { data: existingTags, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (fetchError) throw fetchError;

      // 削除されたタグを特定
      const removedTags = existingTags
        .filter(tag => !normalizedTags.includes(tag.name))
        .map(tag => tag.name);

      // 新しいタグを追加
      const newTags = normalizedTags.filter(tag => 
        !existingTags.some(existingTag => existingTag.name.toLowerCase() === tag.toLowerCase())
      );

      if (newTags.length > 0) {
        const { error: insertError } = await supabase
          .from('tags')
          .insert(
            newTags.map(name => ({
              name,
              user_id: session.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );
        
        if (insertError) throw insertError;
      }

      // 削除されたタグを削除
      if (removedTags.length > 0) {
        // まず、bookmarks_tagsから関連付けを削除
        const { error: deleteBookmarksTagsError } = await supabase
          .from('bookmarks_tags')
          .delete()
          .in('tag_id', existingTags
            .filter(tag => removedTags.includes(tag.name))
            .map(tag => tag.id)
          );
        
        if (deleteBookmarksTagsError) throw deleteBookmarksTagsError;

        // 次に、タグ自体を削除
        const { error: deleteTagsError } = await supabase
          .from('tags')
          .delete()
          .eq('user_id', session.user.id)
          .in('name', removedTags);
        
        if (deleteTagsError) throw deleteTagsError;
      }

      // タグ一覧を更新
      await fetchTags();

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
      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('タグの更新中にエラーが発生しました。');
    }
  };

  const handleBookmarkClick = async (bookmark: BookmarkUI) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { error } = await supabase
        .from('bookmarks')
        .update({
          access_count: (bookmark.accessCount || 0) + 1
        })
        .eq('id', bookmark.id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;

      const { data: updatedBookmarks, error: fetchError } = await supabase
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
      
      if (fetchError) throw fetchError;

      // タグ情報を整形
      const formattedBookmarks = updatedBookmarks.map(convertToUI);

      handleBookmarksUpdate(formattedBookmarks);
      window.open(bookmark.url, '_blank');
    } catch (error) {
      console.error('Error updating bookmark access:', error);
      // エラー処理を追加
    }
  };

  const sortBookmarks = (bookmarks: BookmarkUI[]) => {
    return [...bookmarks].sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case 'accessCount':
          comparison = (a.accessCount || 0) - (b.accessCount || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return currentOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => bookmark.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedBookmarks = sortBookmarks(filteredBookmarks);
  const pinnedBookmarks = sortedBookmarks.filter(b => b.isPinned);
  const unpinnedBookmarks = sortedBookmarks.filter(b => !b.isPinned);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen">
      <main className={cn(
        "min-h-screen p-2 transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}>
        <div className="w-full">
          <BookmarkHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTags={selectedTags}
            onAddBookmark={() => {
              setSelectedBookmark(undefined);
              setIsModalOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTags={filterTags}
            onTagClick={handleTagClick}
            onUpdateTags={handleUpdateTags}
            onClearAll={() => setSelectedTags([])}
            onBookmarksUpdate={handleBookmarksUpdate}
            bookmarks={bookmarks}
          />

          <div className="my-4">
            <SortControls
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortChange={setCurrentSort}
              onOrderChange={setCurrentOrder}
            />
          </div>

          <BookmarkList
            pinnedBookmarks={pinnedBookmarks}
            unpinnedBookmarks={unpinnedBookmarks}
            viewMode={viewMode}
            onTogglePin={handleTogglePin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBookmarkClick={handleBookmarkClick}
          />

          {isModalOpen && (
            <BookmarkForm
              bookmark={selectedBookmark}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedBookmark(undefined);
              }}
              onSave={handleSave}
              availableTags={availableTags}
              onUpdateTags={handleUpdateTags}
            />
          )}
        </div>
      </main>
      <ThemeSwitcher />
    </div>
  );
}