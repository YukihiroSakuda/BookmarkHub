"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookmarkList } from "@/components/BookmarkList";
import { BookmarkHeader } from "@/components/BookmarkHeader";
import { Bookmark, BookmarkUI, SortOption, SortOrder } from "@/types/bookmark";
import { useImportBookmarks } from "@/components/ImportBookmarks";
import { BookmarkForm } from "@/components/BookmarkForm";
import { SortControls } from "@/components/SortControls";
import LoadingScreen from "./loading";
import { cn } from "@/utils/ui";
import { supabase } from "@/lib/supabaseClient";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { TagRule } from "@/types/tagRule";
import {
  UserSettingsUI,
  convertUserSettingsToUI,
  convertUserSettingsToDB,
} from "@/types/userSettings";
import { SavingOrderOverlay } from "@/components/SavingOrderOverlay";

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
  custom_order?: number;
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [listColumns, setListColumns] = useState<1 | 2 | 3 | 4>(4);
  const [userSettings, setUserSettings] = useState<UserSettingsUI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<
    BookmarkUI | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [currentSort, setCurrentSort] = useState<SortOption>("accessCount");
  const [currentOrder, setCurrentOrder] = useState<SortOrder>("desc");
  const [tagRules, setTagRules] = useState<TagRule[]>([]);
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [originalViewMode, setOriginalViewMode] = useState<"list" | "grid">(
    "grid"
  );
  const [originalListColumns, setOriginalListColumns] = useState<1 | 2 | 3 | 4>(
    4
  );
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [originalBookmarkOrder, setOriginalBookmarkOrder] = useState<
    BookmarkUI[]
  >([]);

  // SupabaseのデータをUI用のデータに変換する関数
  const convertToUI = (bookmark: BookmarkWithTags): BookmarkUI => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    tags: bookmark.bookmarks_tags.map((bt) => bt.tags.name),
    isPinned: bookmark.is_pinned,
    createdAt: bookmark.created_at,
    updatedAt: bookmark.updated_at,
    accessCount: bookmark.access_count,
    lastAccessedAt: undefined,
    customOrder: bookmark.custom_order,
  });

  // UI用のデータをSupabase用のデータに変換する関数
  const convertToDB = (
    bookmark: BookmarkUI,
    userId: string
  ): Omit<Bookmark, "id"> => ({
    title: bookmark.title,
    url: bookmark.url,
    is_pinned: bookmark.isPinned,
    created_at: bookmark.createdAt,
    updated_at: bookmark.updatedAt,
    access_count: bookmark.accessCount,
    user_id: userId,
    custom_order: bookmark.customOrder,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth error:", error);
          router.push("/auth");
          return;
        }
        if (!session) {
          router.push("/auth");
          return;
        }
        setIsLoading(false);
        setTimeout(() => {
          setIsVisible(true);
        }, 300);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/auth");
      }
    };
    checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth");
      } else if (event === "USER_UPDATED") {
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }
        const { data: updatedBookmarks, error } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", session.user.id);
        if (error) throw error;
        const uiBookmarks = updatedBookmarks.map(convertToUI);
        setBookmarks(uiBookmarks);
        // タグもDBから取得
        const { data: tags, error: tagsError } = await supabase
          .from("tags")
          .select("*")
          .eq("user_id", session.user.id);
        if (tagsError) throw tagsError;
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error importing bookmarks:", error);
      }
    },
  });

  const handleBookmarksUpdate = useCallback(
    async (updatedBookmarks: BookmarkUI[]) => {
      setBookmarks(updatedBookmarks);

      // タグ一覧を更新
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }
        const { data: tags, error: tagsError } = await supabase
          .from("tags")
          .select("*")
          .eq("user_id", session.user.id);
        if (tagsError) throw tagsError;
        setAvailableTags(tags);
        setSelectedTags((prev) =>
          prev.filter((tagId) => tags.some((t) => t.id === tagId))
        );
      } catch (error) {
        console.error("Error updating tags:", error);
      }
    },
    []
  );

  // タグを取得する関数
  const fetchTags = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { data: tags, error: tagsError } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", session.user.id);

      if (tagsError) throw tagsError;

      console.log("Fetched tags:", tags);
      setAvailableTags(tags); // idとnameを持つTag[]でセット
      return tags;
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  };

  // ユーザ設定を保存する関数
  const saveUserSettings = useCallback(async (settings: UserSettingsUI) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const dbSettings = convertUserSettingsToDB(settings, session.user.id);

      const { error } = await supabase
        .from("user_settings")
        .upsert([dbSettings], {
          onConflict: "user_id",
        });

      if (error) throw error;

      setUserSettings(settings);
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  }, []);

  // ユーザ設定を取得する関数
  const fetchUserSettings = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw error;
      }

      if (settings) {
        const uiSettings = convertUserSettingsToUI(settings);
        setUserSettings(uiSettings);
        setViewMode(uiSettings.displayMode);
        setListColumns(uiSettings.listColumns);
        setCurrentSort(uiSettings.sortOption);
        setCurrentOrder(uiSettings.sortOrder);
      } else {
        // デフォルト設定で新規作成
        const defaultSettings: UserSettingsUI = {
          displayMode: "grid",
          listColumns: 4,
          sortOption: "accessCount",
          sortOrder: "desc",
        };

        // 直接DBに保存（循環依存を避けるため）
        const dbSettings = convertUserSettingsToDB(
          defaultSettings,
          session.user.id
        );
        const { error: insertError } = await supabase
          .from("user_settings")
          .upsert([dbSettings], {
            onConflict: "user_id",
          });

        if (insertError) throw insertError;

        setUserSettings(defaultSettings);
        setViewMode(defaultSettings.displayMode);
        setListColumns(defaultSettings.listColumns);
        setCurrentSort(defaultSettings.sortOption);
        setCurrentOrder(defaultSettings.sortOrder);
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      // エラー時はデフォルト値を設定
      const defaultSettings: UserSettingsUI = {
        displayMode: "grid",
        listColumns: 4,
        sortOption: "accessCount",
        sortOrder: "desc",
      };
      setUserSettings(defaultSettings);
      setViewMode(defaultSettings.displayMode);
      setListColumns(defaultSettings.listColumns);
      setCurrentSort(defaultSettings.sortOption);
      setCurrentOrder(defaultSettings.sortOrder);
    }
  }, []);

  // タグルールを取得する関数
  const fetchTagRules = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { data: rules, error } = await supabase
        .from("tag_rules")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;

      const converted = (rules || []).map((rule) => ({
        ...rule,
        matchType: rule.match_type,
        targetField: rule.target_field,
        tagId: rule.tag_id,
      }));
      setTagRules(converted);
    } catch (error) {
      console.error("Error fetching tag rules:", error);
    }
  }, []);

  useEffect(() => {
    const fetchBookmarksAndTags = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        // ユーザ設定を取得
        await fetchUserSettings();

        // タグを取得
        await fetchTags();

        // タグルールを取得
        await fetchTagRules();

        // ブックマークを取得
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select(
            `
            *,
            bookmarks_tags (
              tags (
                name
              )
            )
          `
          )
          .eq("user_id", session.user.id);

        if (bookmarksError) throw bookmarksError;

        // タグ情報を整形
        const formattedBookmarks = bookmarks.map(convertToUI);
        handleBookmarksUpdate(formattedBookmarks);
      } catch (error) {
        console.error("Error fetching data:", error);
        window.location.href = "/auth";
      }
    };
    fetchBookmarksAndTags();
  }, [fetchTagRules, fetchUserSettings, handleBookmarksUpdate]);

  const handleSave = async (bookmarkData: Omit<BookmarkUI, "id">) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // タグルール適用
      const autoTagIds = tagRules
        .filter((rule) => {
          const target =
            rule.targetField === "title"
              ? bookmarkData.title
              : bookmarkData.url;
          const pattern = rule.pattern.toLowerCase();
          const value = target.toLowerCase();
          if (rule.matchType === "starts_with")
            return value.startsWith(pattern);
          if (rule.matchType === "contains") return value.includes(pattern);
          if (rule.matchType === "ends_with") return value.endsWith(pattern);
          return false;
        })
        .map((rule) => rule.tagId);

      // tagId→tagName変換
      const autoTagNames = availableTags
        .filter((tag) => autoTagIds.includes(tag.id))
        .map((tag) => tag.name);

      // bookmarkData.tagsに自動タグを追加（重複除外）
      const mergedTags = Array.from(
        new Set([...bookmarkData.tags, ...autoTagNames])
      );

      let bookmarkId: string;

      if (selectedBookmark) {
        // 編集時は既存のcustomOrderを保持
        const bookmarkToSave = convertToDB(
          {
            id: selectedBookmark.id,
            ...bookmarkData,
            tags: mergedTags,
            customOrder: selectedBookmark.customOrder,
          },
          session.user.id
        );

        const { error } = await supabase
          .from("bookmarks")
          .update(bookmarkToSave)
          .eq("id", selectedBookmark.id)
          .eq("user_id", session.user.id);

        if (error) throw error;
        bookmarkId = selectedBookmark.id;
      } else {
        // 新規作成時は適切な初期値を設定
        // 既存ブックマークの最大custom_orderを取得して+1する
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from("bookmarks")
          .select("custom_order")
          .eq("user_id", session.user.id)
          .order("custom_order", { ascending: false })
          .limit(1);

        if (maxOrderError) throw maxOrderError;

        const nextOrder =
          maxOrderData && maxOrderData.length > 0
            ? (maxOrderData[0].custom_order || 0) + 1
            : 1;

        const bookmarkToSave = convertToDB(
          { id: "", ...bookmarkData, tags: mergedTags, customOrder: nextOrder },
          session.user.id
        );

        const { data, error } = await supabase
          .from("bookmarks")
          .insert([bookmarkToSave])
          .select("id")
          .single();

        if (error) throw error;
        bookmarkId = data.id;
      }

      // タグの保存
      // 既存のbookmarks_tagsを必ず削除
      const { error: deleteError } = await supabase
        .from("bookmarks_tags")
        .delete()
        .eq("bookmark_id", bookmarkId);
      if (deleteError) throw deleteError;

      if (mergedTags.length > 0) {
        // 既存のタグを取得
        const { data: existingTags, error: tagsError } = await supabase
          .from("tags")
          .select("id, name")
          .eq("user_id", session.user.id)
          .in("name", mergedTags);

        if (tagsError) throw tagsError;

        // 新しいタグを作成
        const autoNewTags = mergedTags.filter(
          (tag) => !existingTags.some((et) => et.name === tag)
        );

        if (autoNewTags.length > 0) {
          const { data: insertedTags, error: insertError } = await supabase
            .from("tags")
            .insert(
              autoNewTags.map((name) => ({
                name,
                user_id: session.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }))
            )
            .select("id, name");

          if (insertError) throw insertError;
          existingTags.push(...insertedTags);
        }

        // 新しいbookmarks_tagsを作成
        const { error: insertError } = await supabase
          .from("bookmarks_tags")
          .insert(
            existingTags.map((tag) => ({
              bookmark_id: bookmarkId,
              tag_id: tag.id,
              created_at: new Date().toISOString(),
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
        .from("bookmarks")
        .select(
          `
          *,
          bookmarks_tags (
            tags (
              name
            )
          )
        `
        )
        .eq("user_id", session.user.id);

      if (fetchError) throw fetchError;

      // タグ情報を整形
      const formattedBookmarks = updatedBookmarks.map(convertToUI);

      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  const handleEdit = useCallback((bookmark: BookmarkUI) => {
    setSelectedBookmark(bookmark);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", id)
          .eq("user_id", session.user.id);

        if (error) throw error;

        // ブックマークを再取得（タグ情報を含む）
        const { data: updatedBookmarks, error: fetchError } = await supabase
          .from("bookmarks")
          .select(
            `
          *,
          bookmarks_tags (
            tags (
              name
            )
          )
        `
          )
          .eq("user_id", session.user.id);

        if (fetchError) throw fetchError;

        // タグ情報を整形
        const formattedBookmarks = updatedBookmarks.map(convertToUI);
        handleBookmarksUpdate(formattedBookmarks);
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        alert("ブックマークの削除中にエラーが発生しました。");
      }
    },
    [handleBookmarksUpdate]
  );

  const handleTogglePin = useCallback(
    async (id: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        const bookmark = bookmarks.find((b) => b.id === id);
        if (!bookmark) return;

        const { error } = await supabase
          .from("bookmarks")
          .update({ is_pinned: !bookmark.isPinned })
          .eq("id", id)
          .eq("user_id", session.user.id);

        if (error) throw error;

        // ブックマークを再取得（タグ情報を含む）
        const { data: updatedBookmarks, error: fetchError } = await supabase
          .from("bookmarks")
          .select(
            `
          *,
          bookmarks_tags (
            tags (
              name
            )
          )
        `
          )
          .eq("user_id", session.user.id);

        if (fetchError) throw fetchError;

        // タグ情報を整形
        const formattedBookmarks = updatedBookmarks.map(convertToUI);
        handleBookmarksUpdate(formattedBookmarks);
      } catch (error) {
        console.error("Error toggling pin:", error);
        alert("ブックマークのピン状態の更新中にエラーが発生しました。");
      }
    },
    [bookmarks, handleBookmarksUpdate]
  );

  const handleTagClick = useCallback(
    (tag: string, ctrlKey: boolean = false) => {
      setSelectedTags((prev) => {
        if (ctrlKey) {
          // Ctrl+クリック: 複数選択モード
          return prev.includes(tag)
            ? prev.filter((t) => t !== tag)
            : [...prev, tag];
        } else {
          // 通常クリック: ラジオボタンモード
          if (prev.includes(tag) && prev.length === 1) {
            // 選択済みのタグが1つだけの場合は非選択にする
            return [];
          } else {
            // そのタグのみを選択する
            return [tag];
          }
        }
      });
    },
    []
  );

  const handleUpdateTags = async (tags: string[]) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // タグの正規化
      const normalizedTags = tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // 既存のタグを取得
      const { data: existingTags, error: fetchError } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", session.user.id);

      if (fetchError) throw fetchError;

      // 削除されたタグを特定
      const removedTags = existingTags
        .filter((tag) => !normalizedTags.includes(tag.name))
        .map((tag) => tag.name);

      // 新しいタグを追加
      const newTags = normalizedTags.filter(
        (tag) =>
          !existingTags.some(
            (existingTag) =>
              existingTag.name.toLowerCase() === tag.toLowerCase()
          )
      );

      if (newTags.length > 0) {
        const { error: insertError } = await supabase.from("tags").insert(
          newTags.map((name) => ({
            name,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );

        if (insertError) throw insertError;
      }

      // 削除されたタグを削除
      if (removedTags.length > 0) {
        // まず、bookmarks_tagsから関連付けを削除
        const { error: deleteBookmarksTagsError } = await supabase
          .from("bookmarks_tags")
          .delete()
          .in(
            "tag_id",
            existingTags
              .filter((tag) => removedTags.includes(tag.name))
              .map((tag) => tag.id)
          );

        if (deleteBookmarksTagsError) throw deleteBookmarksTagsError;

        // 次に、タグ自体を削除
        const { error: deleteTagsError } = await supabase
          .from("tags")
          .delete()
          .eq("user_id", session.user.id)
          .in("name", removedTags);

        if (deleteTagsError) throw deleteTagsError;
      }

      // タグ一覧を更新
      await fetchTags();

      // ブックマークのタグを更新
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select(
          `
          *,
          bookmarks_tags (
            tags (
              name
            )
          )
        `
        )
        .eq("user_id", session.user.id);

      if (bookmarksError) throw bookmarksError;

      // タグ情報を整形
      const formattedBookmarks = bookmarks.map(convertToUI);
      handleBookmarksUpdate(formattedBookmarks);
    } catch (error) {
      console.error("Error updating tags:", error);
      alert("タグの更新中にエラーが発生しました。");
    }
  };

  const handleBookmarkClick = useCallback(
    async (bookmark: BookmarkUI) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        const { error } = await supabase
          .from("bookmarks")
          .update({
            access_count: (bookmark.accessCount || 0) + 1,
          })
          .eq("id", bookmark.id)
          .eq("user_id", session.user.id);

        if (error) throw error;

        const { data: updatedBookmarks, error: fetchError } = await supabase
          .from("bookmarks")
          .select(
            `
          *,
          bookmarks_tags (
            tags (
              name
            )
          )
        `
          )
          .eq("user_id", session.user.id);

        if (fetchError) throw fetchError;

        // タグ情報を整形
        const formattedBookmarks = updatedBookmarks.map(convertToUI);

        handleBookmarksUpdate(formattedBookmarks);
        window.open(bookmark.url, "_blank");
      } catch (error) {
        console.error("Error updating bookmark access:", error);
        // エラー処理を追加
      }
    },
    [handleBookmarksUpdate]
  );

  // カスタム順序をデータベースに保存
  const saveCustomOrder = useCallback(async () => {
    setIsSavingOrder(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // 現在のブックマーク一覧から順序を生成
      const currentPinned = bookmarks.filter((b) => b.isPinned);
      const currentUnpinned = bookmarks.filter((b) => !b.isPinned);

      const pinnedUpdates = currentPinned.map((bookmark, index) => ({
        id: bookmark.id,
        custom_order: index,
      }));

      const unpinnedUpdates = currentUnpinned.map((bookmark, index) => ({
        id: bookmark.id,
        custom_order: index + 1000, // ピン留めされていないものは1000以降の番号
      }));

      const allUpdates = [...pinnedUpdates, ...unpinnedUpdates];

      // ローカル状態を即座に更新
      setBookmarks((prevBookmarks) =>
        prevBookmarks.map((bookmark) => {
          const update = allUpdates.find((u) => u.id === bookmark.id);
          return update
            ? { ...bookmark, customOrder: update.custom_order }
            : bookmark;
        })
      );

      // データベースを更新
      for (const update of allUpdates) {
        const { error } = await supabase
          .from("bookmarks")
          .update({ custom_order: update.custom_order })
          .eq("id", update.id)
          .eq("user_id", session.user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving custom order:", error);
      // エラー時はデータベースから再取得
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: updatedBookmarks, error: fetchError } = await supabase
            .from("bookmarks")
            .select(
              `
              *,
              bookmarks_tags (
                tags (
                  name
                )
              )
            `
            )
            .eq("user_id", session.user.id);

          if (!fetchError) {
            const formattedBookmarks = updatedBookmarks.map(convertToUI);
            handleBookmarksUpdate(formattedBookmarks);
          }
        }
      } catch (retryError) {
        console.error("Error retrying fetch:", retryError);
      }
    } finally {
      setIsSavingOrder(false);
    }
  }, [bookmarks, handleBookmarksUpdate, convertToUI]);

  // 並び替えモードの切り替え処理
  const handleOrderingModeToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        // 並び替えモードを開始する前に、現在のソート順でbookmarks配列を更新
        const currentFiltered = bookmarks.filter((bookmark) => {
          const matchesSearch = bookmark.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tag) => bookmark.tags.includes(tag));
          return matchesSearch && matchesTags;
        });

        const currentSorted = [...currentFiltered].sort((a, b) => {
          let comparison = 0;
          switch (currentSort) {
            case "accessCount":
              comparison = (a.accessCount || 0) - (b.accessCount || 0);
              break;
            case "title":
              comparison = a.title.localeCompare(b.title);
              break;
            case "createdAt":
              comparison =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
              break;
            case "custom":
              comparison = (a.customOrder || 0) - (b.customOrder || 0);
              break;
          }
          return currentSort === "custom"
            ? comparison
            : currentOrder === "asc"
            ? comparison
            : -comparison;
        });

        // フィルタリング対象外のアイテムを取得
        const nonFiltered = bookmarks.filter((bookmark) => {
          const matchesSearch = bookmark.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tag) => bookmark.tags.includes(tag));
          return !(matchesSearch && matchesTags);
        });

        // ソートされた順序でbookmarks配列を更新
        const newOrder = [...currentSorted, ...nonFiltered];
        setBookmarks(newOrder);

        // 元の順序を保存
        setOriginalBookmarkOrder([...bookmarks]);

        // 並び替えモードを開始
        setOriginalViewMode(viewMode);
        setOriginalListColumns(listColumns);
        setIsOrderingMode(true);
      } else {
        // 現在の順序と元の順序を比較して変更があるかチェック
        const hasOrderChanged = !bookmarks.every(
          (bookmark, index) => originalBookmarkOrder[index]?.id === bookmark.id
        );

        if (hasOrderChanged) {
          // 変更がある場合のみ保存
          await saveCustomOrder();
        }

        // 並び替えモードを終了
        setIsOrderingMode(false);
        setViewMode(originalViewMode);
        setListColumns(originalListColumns);
        setOriginalBookmarkOrder([]);
      }
    },
    [
      viewMode,
      listColumns,
      originalViewMode,
      originalListColumns,
      saveCustomOrder,
      bookmarks,
      searchQuery,
      selectedTags,
      currentSort,
      currentOrder,
      originalBookmarkOrder,
    ]
  );

  // ドラッグアンドドロップでの並び替え処理
  const handleReorder = useCallback(
    (oldIndex: number, newIndex: number, isPinned: boolean) => {
      setBookmarks((prevBookmarks) => {
        // 現在のフィルタリング条件を適用
        const filtered = prevBookmarks.filter((bookmark) => {
          const matchesSearch = bookmark.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tag) => bookmark.tags.includes(tag));
          return matchesSearch && matchesTags;
        });

        const pinnedFiltered = filtered.filter((b) => b.isPinned);
        const unpinnedFiltered = filtered.filter((b) => !b.isPinned);

        const sourceArray = isPinned ? pinnedFiltered : unpinnedFiltered;
        const reorderedArray = [...sourceArray];
        const [removed] = reorderedArray.splice(oldIndex, 1);
        reorderedArray.splice(newIndex, 0, removed);

        // 並び替えされた配列を作成
        const reorderedFiltered = isPinned
          ? [...reorderedArray, ...unpinnedFiltered]
          : [...pinnedFiltered, ...reorderedArray];

        // 元の配列から、フィルタリングされたアイテムを除外して、並び替え済みのアイテムを追加
        const nonFilteredBookmarks = prevBookmarks.filter((bookmark) => {
          const matchesSearch = bookmark.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tag) => bookmark.tags.includes(tag));
          return !(matchesSearch && matchesTags);
        });

        return [...reorderedFiltered, ...nonFilteredBookmarks];
      });
    },
    [searchQuery, selectedTags]
  );

  const filteredAndSortedBookmarks = useMemo(() => {
    const filtered = bookmarks.filter((bookmark) => {
      const matchesSearch = bookmark.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => bookmark.tags.includes(tag));
      return matchesSearch && matchesTags;
    });

    // 並び替えモード時は現在のbookmarks配列の順序を保持
    let sorted;
    if (isOrderingMode && currentSort === "custom") {
      // 並び替えモード時は配列の順序をそのまま保持
      sorted = filtered;
    } else {
      // 通常時は指定されたソート順で並び替え
      sorted = [...filtered].sort((a, b) => {
        let comparison = 0;
        switch (currentSort) {
          case "accessCount":
            comparison = (a.accessCount || 0) - (b.accessCount || 0);
            break;
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "custom":
            comparison = (a.customOrder || 0) - (b.customOrder || 0);
            break;
        }
        return currentSort === "custom"
          ? comparison
          : currentOrder === "asc"
          ? comparison
          : -comparison;
      });
    }

    return {
      pinned: sorted.filter((b) => b.isPinned),
      unpinned: sorted.filter((b) => !b.isPinned),
    };
  }, [
    bookmarks,
    searchQuery,
    selectedTags,
    currentSort,
    currentOrder,
    isOrderingMode,
  ]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen">
      <main
        className={cn(
          "min-h-screen p-2 transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-full">
          <BookmarkHeader
            viewMode={viewMode}
            onViewModeChange={async (mode) => {
              setViewMode(mode);
              if (userSettings) {
                const newSettings = { ...userSettings, displayMode: mode };
                await saveUserSettings(newSettings);
              }
            }}
            listColumns={listColumns}
            onListColumnsChange={async (columns) => {
              setListColumns(columns);
              if (userSettings) {
                const newSettings = { ...userSettings, listColumns: columns };
                await saveUserSettings(newSettings);
              }
            }}
            selectedTags={selectedTags}
            onAddBookmark={() => {
              setSelectedBookmark(undefined);
              setIsModalOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTags={availableTags}
            onTagClick={handleTagClick}
            onClearAll={() => setSelectedTags([])}
            onBookmarksUpdate={handleBookmarksUpdate}
            bookmarks={bookmarks}
            tagRules={tagRules}
            onTagRulesChange={fetchTagRules}
            isOrderingMode={isOrderingMode}
          />

          <div className="my-4">
            <SortControls
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortChange={async (sortOption) => {
                setCurrentSort(sortOption);
                if (userSettings) {
                  const newSettings = { ...userSettings, sortOption };
                  await saveUserSettings(newSettings);
                }
              }}
              onOrderChange={async (sortOrder) => {
                setCurrentOrder(sortOrder);
                if (userSettings) {
                  const newSettings = { ...userSettings, sortOrder };
                  await saveUserSettings(newSettings);
                }
              }}
              isOrderingMode={isOrderingMode}
              onOrderingModeChange={handleOrderingModeToggle}
              isSavingOrder={isSavingOrder}
            />
          </div>

          <BookmarkList
            pinnedBookmarks={filteredAndSortedBookmarks.pinned}
            unpinnedBookmarks={filteredAndSortedBookmarks.unpinned}
            viewMode={isOrderingMode ? "list" : viewMode}
            listColumns={isOrderingMode ? 1 : listColumns}
            onTogglePin={handleTogglePin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBookmarkClick={handleBookmarkClick}
            isOrderingMode={isOrderingMode}
            onReorder={handleReorder}
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

        {/* Footer with tech stack and theme switcher */}
        <footer className="mt-8 pb-4 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>Built with</span>

            {/* Next.js */}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black dark:text-white"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c1.99 0 3.8-0.73 5.19-1.93l-6.11-8.33v8.26h-1.08V4.54h1.08l6.84 9.36C15.26 12.42 16 10.31 16 8c0-4.42-3.58-8-8-8z"
                  fill="currentColor"
                />
              </svg>
              Next.js
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#61DAFB]"
              >
                <path
                  d="M12 10.11c1.03 0 1.87.84 1.87 1.89s-.84 1.89-1.87 1.89c-1.03 0-1.87-.84-1.87-1.89s.84-1.89 1.87-1.89zM7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96zm.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51zm6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.95-1.44-.54-.69-1.06-1.31-1.54-1.85-.48.54-1 1.16-1.54 1.85-.33.44-.65.91-.95 1.44l-.81 1.5.81 1.5c.3.53.62 1 .95 1.44.54.69 1.06 1.31 1.54 1.85.48-.54 1-.16 1.54-1.85.33-.44.65-.91.95-1.44zM12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72z"
                  fill="currentColor"
                />
              </svg>
              React
            </a>
            <a
              href="https://www.typescriptlang.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#3178C6]"
              >
                <path
                  d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
                  fill="currentColor"
                />
              </svg>
              TypeScript
            </a>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#3ECF8E]"
              >
                <path
                  d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12V23.604a.396.396 0 0 0 .716.233L21.797 11.576l.401-.562a1.04 1.04 0 0 0-.836-1.66z"
                  fill="currentColor"
                />
              </svg>
              Supabase
            </a>
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#06B6D4]"
              >
                <path
                  d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zM6.001 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
                  fill="currentColor"
                />
              </svg>
              Tailwind
            </a>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 256 256"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black dark:text-white"
              >
                <rect width="256" height="256" rx="60" fill="currentColor"/>
                <path
                  d="m208 128-80 80-80-80 80-80 80 80Z"
                  fill="white"
                />
                <path
                  d="m208 128-80 80v-80h80Z"
                  fill="white"
                  fillOpacity="0.3"
                />
              </svg>
              shadcn/ui
            </a>
          </div>
          <ThemeSwitcher />
        </footer>
      </main>
      <SavingOrderOverlay isVisible={isSavingOrder} />
    </div>
  );
}
