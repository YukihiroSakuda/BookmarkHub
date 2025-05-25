'use client';

import { useState } from 'react';
import { getBookmarks, saveBookmarks } from '@/utils/storage';
import { Bookmark } from '@/types/bookmark';

interface UseImportBookmarksProps {
  onImportComplete?: (importedCount: number) => void;
  onBookmarksUpdate?: (bookmarks: Bookmark[]) => void;
}

export function useImportBookmarks({ 
  onImportComplete,
  onBookmarksUpdate 
}: UseImportBookmarksProps = {}) {
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // 日本時間のISO文字列を生成する関数
  const getJSTISOString = (date: Date): string => {
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return jstDate.toISOString();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const links = doc.getElementsByTagName('a');
      
      // 既存のブックマークを取得
      const existingBookmarks = getBookmarks();
      
      // 新しいブックマークを作成
      const newBookmarks: Bookmark[] = Array.from(links).map(link => {
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
          id: crypto.randomUUID(),
          title: link.textContent || '',
          url: link.href,
          tags: [],
          isPinned: false,
          createdAt,
          updatedAt: createdAt,
          accessCount: 0,
          favicon: undefined
        };
      });

      // 重複をチェック（URLベース）
      const uniqueNewBookmarks = newBookmarks.filter(newBookmark => 
        !existingBookmarks.some(existing => existing.url === newBookmark.url)
      );

      // 既存のブックマークと新しいブックマークを結合
      const updatedBookmarks = [...existingBookmarks, ...uniqueNewBookmarks];
      
      // ローカルストレージに保存
      saveBookmarks(updatedBookmarks);

      // ブックマークリストを更新
      onBookmarksUpdate?.(updatedBookmarks);

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
    handleFileUpload,
    onImportComplete
  };
} 