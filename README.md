# BookmarkHub

モダンなUIと使いやすい機能を備えたブックマーク管理アプリケーション。

## 機能一覧

### ブックマーク管理
- ブックマークの追加・編集・削除
- タイトル、URL、タグの管理
- ピン留め機能
- リスト表示とグリッド表示の切り替え

### タグ管理
- タグの追加・編集・削除
- タグ別表示
- タグによるフィルタリング

### 検索機能
- タイトル、URL、タグによる検索
- リアルタイム検索

### UI/UX
- モダンなデザイン
- レスポンシブ対応
- アニメーション効果
- ダークモード

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide Icons
- **状態管理**: React Hooks
- **ストレージ**: LocalStorage

## セットアップ手順

1. リポジトリのクローン
```bash
git clone https://github.com/YukihiroSakuda/BookmarkHub.git
cd BookmarkHub
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

4. ブラウザで確認
```
http://localhost:3000
```

## 開発ガイドライン

### プロジェクト構造
```
src/
  ├── app/              # アプリケーションのルート
  ├── components/       # 共通コンポーネント
  ├── types/           # 型定義
  └── utils/           # ユーティリティ関数
```

### コンポーネント設計
- 各コンポーネントは単一責任の原則に従う
- Propsの型定義を必ず行う
- 再利用可能なコンポーネントは`components`ディレクトリに配置

### スタイリング
- Tailwind CSSを使用
- カスタムカラーは`tailwind.config.ts`で定義
- コンポーネント固有のスタイルは該当コンポーネント内で定義

### 状態管理
- ローカルステートは`useState`を使用
- グローバルステートは必要に応じて`Context`を使用
- データの永続化は`LocalStorage`を使用

### 命名規則
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- ファイル名: コンポーネントと同じ名前（PascalCase）

### コミットメッセージ
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: スタイル
- refactor: リファクタリング
- test: テスト
- chore: その他

## ライセンス

MIT License
