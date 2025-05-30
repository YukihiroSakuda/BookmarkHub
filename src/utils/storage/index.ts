import { supabase } from '@/lib/supabaseClient';
import { BookmarkUI, Settings } from '@/types/bookmark';

const SETTINGS_KEY = 'settings';

// ユーザーID取得（セッションから）
async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

// Supabaseからブックマーク一覧を取得
export const getBookmarks = async (): Promise<BookmarkUI[]> => {
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ? data.map((b) => ({
    id: b.id,
    title: b.title,
    url: b.url,
    tags: b.tags || [],
    isPinned: b.is_pinned,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    favicon: b.favicon,
    accessCount: b.access_count,
    lastAccessedAt: b.last_accessed_at
  })) : [];
};

// Supabaseにブックマーク一覧を保存（全置換）
export const saveBookmarks = async (bookmarks: BookmarkUI[]): Promise<void> => {
  const userId = await getUserId();
  if (!userId) return;
  // 既存データ削除
  await supabase.from('bookmarks').delete().eq('user_id', userId);
  // 新規データ挿入
  if (bookmarks.length > 0) {
    await supabase.from('bookmarks').insert(
      bookmarks.map(b => ({
        id: b.id,
        title: b.title,
        url: b.url,
        tags: b.tags,
        is_pinned: b.isPinned,
        created_at: b.createdAt,
        updated_at: b.updatedAt,
        access_count: b.accessCount,
        user_id: userId
      }))
    );
  }
};

// タグ一覧取得
export const getTags = async (): Promise<string[]> => {
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data ? (data as { name: string }[]).map((t) => t.name) : [];
};

// タグ保存（全置換）
export const saveTags = async (tags: string[]): Promise<void> => {
  const userId = await getUserId();
  if (!userId) return;
  // 既存タグ削除
  await supabase.from('tags').delete().eq('user_id', userId);
  // 新規タグ挿入
  if (tags.length > 0) {
    await supabase.from('tags').insert(
      tags.map(name => ({ name, user_id: userId }))
    );
  }
};

// Settingsはローカルストレージのまま
export const getSettings = (): Settings => {
  if (typeof window === 'undefined') {
    return {
      theme: 'light',
      viewMode: 'grid',
      customTags: [],
      itemsPerPage: 12,
    };
  }
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    theme: 'light',
    viewMode: 'grid',
    customTags: [],
    itemsPerPage: 12,
  };
};

export const saveSettings = (settings: Settings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}; 