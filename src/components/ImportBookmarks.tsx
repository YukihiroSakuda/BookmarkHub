'use client';

import { useState } from 'react';
import { BookmarkUI } from '@/types/bookmark';
import { supabase } from '@/lib/supabaseClient';

interface UseImportBookmarksProps {
  onImportComplete?: (importedCount: number) => void;
  onBookmarksUpdate?: (bookmarks: BookmarkUI[]) => void;
}

export function useImportBookmarks({ 
  onImportComplete,
  onBookmarksUpdate 
}: UseImportBookmarksProps = {}) {
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const links = doc.getElementsByTagName('a');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // 既存のブックマークを取得
      const { data: existingBookmarks, error: fetchError } = await supabase
        .from('bookmarks')
        .select('url')
        .eq('user_id', session.user.id);

      if (fetchError) throw fetchError;

      // 新しいブックマークを作成
      const newBookmarks = Array.from(links).map(link => {
        let createdAt: string;
        try {
          const addDate = link.getAttribute('add_date');
          if (addDate && !isNaN(parseInt(addDate))) {
            // UnixタイムスタンプをDate型に変換
            const date = new Date(parseInt(addDate) * 1000);
            createdAt = date.toISOString();
          } else {
            // 現在時刻を使用
            createdAt = new Date().toISOString();
          }
        } catch (error) {
          console.warn('Invalid date format, using current date:', error);
          createdAt = new Date().toISOString();
        }
        
        return {
          title: link.textContent || '',
          url: link.href,
          is_pinned: false,
          created_at: createdAt,
          updated_at: createdAt,
          access_count: 0,
          user_id: session.user.id
        };
      });

      // 重複をチェック（URLベース）
      const uniqueNewBookmarks = newBookmarks.filter(newBookmark => 
        !existingBookmarks?.some(existing => existing.url === newBookmark.url)
      );

      if (uniqueNewBookmarks.length > 0) {
        // 新しいブックマークをデータベースに保存
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert(uniqueNewBookmarks);

        if (insertError) throw insertError;
      }

      // 更新されたブックマーク一覧を取得
      const { data: updatedBookmarks, error: updateError } = await supabase
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

      if (updateError) throw updateError;

      // UI用のデータに変換
      const uiBookmarks = updatedBookmarks.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        tags: bookmark.bookmarks_tags?.map((bt: { tags: { name: string } }) => bt.tags.name) || [],
        isPinned: bookmark.is_pinned,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at,
        accessCount: bookmark.access_count,
        lastAccessedAt: bookmark.last_accessed_at,
        favicon: bookmark.favicon
      }));

      // UIを更新
      onBookmarksUpdate?.(uiBookmarks);

      setImportedCount(uniqueNewBookmarks.length);
      onImportComplete?.(uniqueNewBookmarks.length);
      return uniqueNewBookmarks.length;
    } catch (error) {
      console.error('インポートエラー:', error);
      throw new Error('インポート中にエラーが発生しました');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importedCount,
    handleFileUpload
  };
} 