import {
  Grid,
  List,
  Plus,
  Search,
  Tag,
  X,
  Upload,
  Download,
  MoreVertical,
  Trash2,
  User,
  LogOut,
  BookOpenCheck,
  Columns,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { TagManager } from "./TagManager";
import { Tag as TagComponent } from "./Tag";
import { Button } from "./Button";
import { useImportBookmarks } from "./ImportBookmarks";
import { BookmarkUI, convertToUI } from "@/types/bookmark";
import { exportBookmarksToHtml, downloadHtml } from "@/utils/export";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { TagRule as TagRuleType, TagRuleFormData } from "../types/tagRule";
import { TagRule as TagRuleComponent } from "./TagRule";

interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BookmarkHeaderProps {
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  listColumns: 1 | 2 | 3 | 4;
  onListColumnsChange: (columns: 1 | 2 | 3 | 4) => void;
  selectedTags: string[];
  onAddBookmark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: Tag[];
  onTagClick: (tag: string) => void;
  onClearAll: () => void;
  onBookmarksUpdate: (bookmarks: BookmarkUI[]) => void;
  bookmarks: BookmarkUI[];
  tagRules: TagRuleType[];
  onTagRulesChange: () => Promise<void>;
}

export function BookmarkHeader({
  viewMode,
  onViewModeChange,
  listColumns,
  onListColumnsChange,
  selectedTags,
  onAddBookmark,
  searchQuery,
  onSearchChange,
  availableTags,
  onTagClick,
  onClearAll,
  onBookmarksUpdate,
  bookmarks,
  tagRules,
  onTagRulesChange,
}: BookmarkHeaderProps) {
  const router = useRouter();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isTagRuleOpen, setIsTagRuleOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ユーザー情報の取得
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();

    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target as Node)
      ) {
        setIsColumnsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const { isImporting, handleFileUpload } = useImportBookmarks({
    onImportComplete: (count) => {
      alert(`${count} bookmarks imported successfully!`);
      setIsMoreMenuOpen(false);
    },
    onBookmarksUpdate,
  });

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileUpload({
          target: {
            files: target.files,
          },
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

  const handleDeleteAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all bookmarks and tags? This action cannot be undone."
      )
    ) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        // ブックマークとタグの関連付けを削除
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", session.user.id);

        if (bookmarksError) {
          console.error("Error fetching bookmarks:", bookmarksError);
          throw new Error(
            `Failed to fetch bookmarks: ${bookmarksError.message}`
          );
        }

        if (bookmarks && bookmarks.length > 0) {
          const bookmarkIds = bookmarks.map((b) => b.id);
          const { error: bookmarksTagsError } = await supabase
            .from("bookmarks_tags")
            .delete()
            .in("bookmark_id", bookmarkIds);

          if (bookmarksTagsError) {
            console.error("Error deleting bookmarks_tags:", bookmarksTagsError);
            throw new Error(
              `Failed to delete bookmarks_tags: ${bookmarksTagsError.message}`
            );
          }
        }

        // ブックマークを削除
        const { error: deleteBookmarksError } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", session.user.id);

        if (deleteBookmarksError) {
          console.error("Error deleting bookmarks:", deleteBookmarksError);
          throw new Error(
            `Failed to delete bookmarks: ${deleteBookmarksError.message}`
          );
        }

        // タグを削除
        const { error: tagsError } = await supabase
          .from("tags")
          .delete()
          .eq("user_id", session.user.id);

        if (tagsError) {
          console.error("Error deleting tags:", tagsError);
          throw new Error(`Failed to delete tags: ${tagsError.message}`);
        }

        // UIを更新
        onBookmarksUpdate([]);
        setIsMoreMenuOpen(false);
      } catch (error) {
        console.error("Error deleting all bookmarks and tags:", error);
        alert(
          error instanceof Error
            ? error.message
            : "ブックマークとタグの削除中にエラーが発生しました。"
        );
      }
    }
  };

  // タグルールの取得
  const fetchTagRules = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { error } = await supabase
        .from("tag_rules")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error fetching tag rules:", error);
    }
  }, []);

  useEffect(() => {
    fetchTagRules();
  }, [fetchTagRules]);

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
              className="w-full px-3 py-2 pl-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 focus:outline-none text-base"
            />
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={16}
            />
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
              onClick={() =>
                onViewModeChange(viewMode === "grid" ? "list" : "grid")
              }
              variant="secondary"
              size="lg"
              icon={viewMode === "grid" ? List : Grid}
            />
            {viewMode === "list" && (
              <div className="relative" ref={columnsMenuRef}>
                <Button
                  onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                  variant="secondary"
                  size="lg"
                  icon={Columns}
                />
                {isColumnsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 text-neutral-400 bg-white dark:bg-black backdrop-blur-sm rounded-lg border shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                      List Columns
                    </div>
                    {[1, 2, 3, 4].map((columns) => (
                      <button
                        key={columns}
                        className={`w-full px-4 py-2 text-left text-sm hover:text-black hover:dark:text-white flex items-center gap-2 ${
                          listColumns === columns ? 'text-blue-500' : ''
                        }`}
                        onClick={() => {
                          onListColumnsChange(columns as 1 | 2 | 3 | 4);
                          setIsColumnsMenuOpen(false);
                        }}
                      >
                        {columns} Column{columns > 1 ? 's' : ''}
                        {listColumns === columns && <span className="ml-auto">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    {isImporting ? "Importing..." : "Import from HTML"}
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
                <div className="absolute right-0 mt-2 w-64 text-neutral-400 bg-white dark:bg-black backdrop-blur-sm rounded-lg border shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm border-b border-neutral-200 dark:border-neutral-700 truncate">
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
              <h2 className="text-sm font-medium tracking-tight">
                <span className="text-blue-500">#</span> Filter by Tags
              </h2>
              {selectedTags.length > 0 && (
                <Button onClick={onClearAll} variant="ghost" size="sm" icon={X}>
                  Clear all tags
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button
                  onClick={() => setIsTagManagerOpen(true)}
                  variant="ghost"
                  size="sm"
                  icon={Tag}
                >
                  Tag Manager
                </Button>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={() => setIsTagRuleOpen(true)}
                  variant="ghost"
                  size="sm"
                  icon={BookOpenCheck}
                >
                  Tag Rule
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTags
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tag) => (
                <TagComponent
                  key={tag.id}
                  tag={tag.name}
                  onClick={() => onTagClick(tag.name)}
                  isSelected={selectedTags.includes(tag.name)}
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
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                throw new Error("No active session");
              }

              // タグ名を更新
              const { error: updateError } = await supabase
                .from("tags")
                .update({ name: newName })
                .eq("user_id", session.user.id)
                .eq("name", oldName);

              if (updateError) throw updateError;

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
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error("Error updating tag name:", error);
              alert("Error updating tag name");
              throw error;
            }
          }}
          onAddTag={async (tag) => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                throw new Error("No active session");
              }

              // 新しいタグを追加
              const { error: insertError } = await supabase
                .from("tags")
                .insert({
                  name: tag,
                  user_id: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (insertError) throw insertError;

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
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error("Error adding tag:", error);
              alert("Error adding tag");
              throw error;
            }
          }}
          onRemoveTag={async (tag) => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                throw new Error("No active session");
              }

              // タグIDを取得
              const tagObj = availableTags.find((t) => t.name === tag);
              if (tagObj) {
                // このタグIDを使っているタグルールを全て削除
                const relatedRuleIds = tagRules
                  .filter((r) => r.tagId === tagObj.id)
                  .map((r) => r.id);
                if (relatedRuleIds.length > 0) {
                  await supabase
                    .from("tag_rules")
                    .delete()
                    .in("id", relatedRuleIds)
                    .eq("user_id", session.user.id);
                  await onTagRulesChange();
                }
              }

              // タグを削除
              const { error: deleteError } = await supabase
                .from("tags")
                .delete()
                .eq("user_id", session.user.id)
                .eq("name", tag);

              if (deleteError) throw deleteError;

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
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error("Error removing tag:", error);
              alert("Error removing tag");
              throw error;
            }
          }}
        />
      )}

      {isTagRuleOpen && (
        <TagRuleComponent
          onClose={() => setIsTagRuleOpen(false)}
          rules={tagRules}
          availableTags={availableTags}
          onSave={async (data: TagRuleFormData) => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                throw new Error("No active session");
              }

              const { error } = await supabase.from("tag_rules").insert({
                match_type: data.matchType,
                pattern: data.pattern,
                tag_id: data.tagId,
                target_field: data.targetField,
                user_id: session.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              if (error) throw error;

              await onTagRulesChange();

              // --- ここから既存ブックマークへのタグ付け処理 ---
              const { data: bookmarks, error: bookmarksError } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", session.user.id);
              if (bookmarksError) throw bookmarksError;

              const pattern = data.pattern.toLowerCase();
              const matchFn = (value: string) => {
                if (data.matchType === "starts_with")
                  return value.startsWith(pattern);
                if (data.matchType === "contains")
                  return value.includes(pattern);
                if (data.matchType === "ends_with")
                  return value.endsWith(pattern);
                return false;
              };
              const matched = bookmarks.filter((bm) => {
                const target = (
                  data.targetField === "title" ? bm.title : bm.url
                ).toLowerCase();
                return matchFn(target);
              });
              for (const bm of matched) {
                await supabase.from("bookmarks_tags").upsert(
                  {
                    bookmark_id: bm.id,
                    tag_id: data.tagId,
                    created_at: new Date().toISOString(),
                  },
                  { onConflict: "bookmark_id,tag_id" }
                );
              }
              // --- ここまで ---

              // タグ情報を反映した最新のブックマーク一覧を取得
              const { data: updatedBookmarks, error: fetchError } =
                await supabase
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
              const formattedBookmarks = updatedBookmarks.map(convertToUI);
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error("Error saving tag rule:", error);
              alert("Error saving tag rule");
            }
          }}
          onDelete={async (ruleId: string, removeTags: boolean) => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                throw new Error("No active session");
              }

              // ルール内容を取得
              const rule = tagRules.find((r) => r.id === ruleId);
              if (!rule) throw new Error("Rule not found");

              // ルール削除
              const { error } = await supabase
                .from("tag_rules")
                .delete()
                .eq("id", ruleId)
                .eq("user_id", session.user.id);

              if (error) throw error;

              // タグ付けも削除する場合
              if (removeTags) {
                // ブックマークを取得
                const { data: bookmarks, error: bookmarksError } =
                  await supabase
                    .from("bookmarks")
                    .select("id, title, url")
                    .eq("user_id", session.user.id);
                if (bookmarksError) throw bookmarksError;

                const pattern = rule.pattern.toLowerCase();
                const matchFn = (value: string) => {
                  if (rule.matchType === "starts_with")
                    return value.startsWith(pattern);
                  if (rule.matchType === "contains")
                    return value.includes(pattern);
                  if (rule.matchType === "ends_with")
                    return value.endsWith(pattern);
                  return false;
                };
                const matched = bookmarks.filter((bm) => {
                  const target = (
                    rule.targetField === "title" ? bm.title : bm.url
                  ).toLowerCase();
                  return matchFn(target);
                });
                for (const bm of matched) {
                  await supabase
                    .from("bookmarks_tags")
                    .delete()
                    .eq("bookmark_id", bm.id)
                    .eq("tag_id", rule.tagId);
                }
              }

              await onTagRulesChange();

              // タグ情報を反映した最新のブックマーク一覧を取得
              const { data: updatedBookmarks, error: fetchError } =
                await supabase
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
              const formattedBookmarks = updatedBookmarks.map(convertToUI);
              onBookmarksUpdate(formattedBookmarks);
            } catch (error) {
              console.error("Error deleting tag rule:", error);
              alert("Error deleting tag rule");
            }
          }}
        />
      )}
    </>
  );
}
