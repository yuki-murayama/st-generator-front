# Supabase データベースセットアップ

## 前提条件

- Supabaseプロジェクトが作成されていること
- `.env`ファイルにSupabase URLとAnon Keyが設定されていること

## データベースのセットアップ手順

### 1. スキーマの作成

Supabase Dashboardにアクセスして、SQLエディタを開きます：

1. https://supabase.com/dashboard にアクセス
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. `migrations/001_initial_schema.sql`の内容をコピー&ペースト
5. 「Run」をクリックして実行

### 2. テストデータの投入

同じSQLエディタで：

1. `seed.sql`の内容をコピー&ペースト
2. 「Run」をクリックして実行

投入されるテストデータ：
- **従業員**: 8名（アクティブ7名、非アクティブ1名）
- **現場**: 8件（稼働中5件、完了2件、中断1件）
- **配属**: 7件（アクティブ5件、完了2件）

### 3. Row Level Security (RLS) の設定

現在は開発環境のため、RLSポリシーは設定していません。
本番環境では適切なRLSポリシーを設定してください。

一時的にRLSを無効化する場合（開発環境のみ）：

```sql
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
```

### 4. 環境変数の設定

`.env`ファイルで以下を設定：

```env
VITE_DEV_MODE=false  # 実際のDBを使用する場合はfalse
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## データベースのリセット

テストデータをリセットする場合は、`seed.sql`を再実行してください。
スクリプトの冒頭でデータを削除してから新しいデータを投入します。

## トラブルシューティング

### 外部キー制約エラー

データ削除時に外部キー制約エラーが出る場合は、以下の順序で削除：
1. assignments
2. sites
3. employees

### UUIDエラー

`uuid-ossp`拡張機能が有効になっていない場合は、スキーマ作成時に自動的に有効化されます。

### RLSエラー

RLSが有効な場合、認証されていないアクセスはブロックされます。
開発環境では一時的にRLSを無効化するか、適切なポリシーを設定してください。
