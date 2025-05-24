# コンポーネント一覧

## 共通コンポーネント

### Button
- 用途: アプリケーション全体で使用されるボタン
- バリアント: primary, secondary, ghost
- サイズ: sm, md, lg
- アイコン対応: あり

### Input
- 用途: テキスト入力フィールド
- 機能: ラベル、エラーメッセージ、バリデーション
- スタイル: カスタムデザイン

### Tag
- 用途: タグの表示と選択
- 状態: 選択中、非選択
- スタイル: カスタムデザイン

## 機能コンポーネント

### BookmarkCard
- 用途: ブックマークの表示
- 表示モード: リスト、グリッド
- 機能: ピン留め、編集、削除

### BookmarkForm
- 用途: ブックマークの追加・編集
- 機能: タイトル、URL、タグの入力
- バリデーション: 必須項目チェック

### BookmarkHeader
- 用途: アプリケーションのヘッダー
- 機能: 検索、表示モード切り替え、タグ管理

### BookmarkList
- 用途: ブックマークの一覧表示
- 表示モード: リスト、グリッド
- 機能: ピン留めされたブックマークの分離表示

### TagManager
- 用途: タグの管理
- 機能: タグの追加・編集・削除
- モーダル表示

## 使用例

### ボタン
```tsx
<Button
  variant="primary"
  size="md"
  icon={Plus}
  onClick={handleClick}
>
  Add New
</Button>
```

### 入力フィールド
```tsx
<Input
  id="title"
  label="Title"
  value={title}
  onChange={handleChange}
  required
/>
```

### タグ
```tsx
<Tag
  tag="example"
  isSelected={true}
  onClick={handleClick}
/>
```

## スタイリングガイドライン

### カラー
- プライマリ: energy-purple (#B026FF)
- セカンダリ: energy-green (#00E68C)
- アクセント: energy-pink (#FF2E63)
- 背景: dark (#0F0F0F), dark-lighter (#1A1A1A)

### アニメーション
- トランジション: 300ms ease
- ホバーエフェクト: スケール、シャドウ
- モーダル: フェードイン/アウト

### レスポンシブ
- モバイルファースト
- ブレークポイント: sm, md, lg, xl, 2xl
- グリッドレイアウト: 自動調整 