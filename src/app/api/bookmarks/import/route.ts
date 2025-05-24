import { NextResponse } from 'next/server';
import { getBookmarks, saveBookmarks } from '@/utils/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const links = doc.getElementsByTagName('a');
    
    // 既存のブックマークを取得
    const existingBookmarks = getBookmarks();
    
    // 新しいブックマークを作成
    const newBookmarks = Array.from(links).map(link => ({
      id: crypto.randomUUID(),
      title: link.textContent || '',
      url: link.href,
      tags: [],
      isPinned: false,
      createdAt: link.getAttribute('add_date') || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favicon: undefined
    }));

    // 重複をチェック（URLベース）
    const uniqueNewBookmarks = newBookmarks.filter(newBookmark => 
      !existingBookmarks.some(existing => existing.url === newBookmark.url)
    );

    // 既存のブックマークと新しいブックマークを結合
    const updatedBookmarks = [...existingBookmarks, ...uniqueNewBookmarks];
    
    // ローカルストレージに保存
    saveBookmarks(updatedBookmarks);

    return NextResponse.json({
      message: 'Bookmarks imported successfully',
      importedCount: uniqueNewBookmarks.length
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import bookmarks' },
      { status: 500 }
    );
  }
} 