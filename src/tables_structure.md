# テーブル構成メモ

## bookmarks
| カラム名      | 型         | 説明                |
|:-------------|:-----------|:--------------------|
| id           | uuid       | 主キー              |
| user_id      | uuid       | ユーザーID（外部キー）|
| title        | text       | タイトル            |
| url          | text       | URL                 |
| is_pinned    | bool       | ピン留めフラグ      |
| created_at   | timestamptz| 作成日時            |
| updated_at   | timestamptz| 更新日時            |
| access_count | int4       | アクセス数          |

---

## tags
| カラム名      | 型         | 説明                |
|:-------------|:-----------|:--------------------|
| id           | uuid       | 主キー              |
| user_id      | uuid       | ユーザーID（外部キー）|
| name         | text       | タグ名              |
| created_at   | timestamptz| 作成日時            |
| updated_at   | timestamptz| 更新日時            |

---

## bookmarks_tags
| カラム名      | 型         | 説明                |
|:-------------|:-----------|:--------------------|
| bookmark_id  | uuid       | ブックマークID（外部キー）|
| tag_id       | uuid       | タグID（外部キー）  |
| created_at   | timestamptz| 作成日時            |

---

## auth.users（Supabase認証用）
| カラム名      | 型         | 説明                |
|:-------------|:-----------|:--------------------|
| id           | uuid       | 主キー              |
| ...          | ...        | その他認証情報      | 