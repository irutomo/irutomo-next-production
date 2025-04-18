# Supabase MCPサーバーのセットアップ

このドキュメントでは、Supabaseを使用してMCP（マルチキャッシュプロトコル）サーバーをセットアップする手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- Supabaseの管理者権限があること

## セットアップ手順

### 1. Supabase管理画面にログイン

Supabaseの管理画面（https://supabase.com/dashboard）にログインします。

### 2. プロジェクトを選択

対象のプロジェクトを選択します（URL: https://qgqebyunvamzfaaaypmd.supabase.co）。

### 3. SQLエディタを開く

左側のメニューから「SQL Editor」を選択し、「New query」ボタンをクリックして新しいSQLエディタを開きます。

### 4. テーブル作成SQLを実行

以下のSQLをコピーしてSQLエディタに貼り付け、「Run」ボタンをクリックします：

```sql
-- mcp_messagesテーブルの作成
CREATE TABLE IF NOT EXISTS public.mcp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  environment TEXT,
  app_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクセス権限の設定
ALTER TABLE public.mcp_messages ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーがレコードを挿入できるようにするポリシー
CREATE POLICY "匿名ユーザーの挿入を許可" ON public.mcp_messages
  FOR INSERT WITH CHECK (true);

-- 匿名ユーザーが自分の挿入したレコードを選択できるようにするポリシー
CREATE POLICY "匿名ユーザーの選択を許可" ON public.mcp_messages
  FOR SELECT USING (true);

-- RLSを有効化
ALTER TABLE public.mcp_messages FORCE ROW LEVEL SECURITY;

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS mcp_messages_timestamp_idx ON public.mcp_messages (timestamp DESC);
CREATE INDEX IF NOT EXISTS mcp_messages_type_idx ON public.mcp_messages (type);
CREATE INDEX IF NOT EXISTS mcp_messages_environment_idx ON public.mcp_messages (environment);

-- コメント
COMMENT ON TABLE public.mcp_messages IS 'MCPサーバーメッセージの保存用テーブル';
COMMENT ON COLUMN public.mcp_messages.type IS 'メッセージタイプ（REQUEST/RESPONSE/ERROR）';
COMMENT ON COLUMN public.mcp_messages.payload IS 'メッセージ本体（JSON形式）';
COMMENT ON COLUMN public.mcp_messages.timestamp IS 'メッセージのタイムスタンプ（エポックミリ秒）';
COMMENT ON COLUMN public.mcp_messages.environment IS '環境（development/production）';
COMMENT ON COLUMN public.mcp_messages.app_name IS 'アプリケーション名';
```

### 5. テーブルの確認

左側のメニューから「Table Editor」を選択し、「mcp_messages」テーブルが作成されていることを確認します。

### 6. 接続テストの実行

アプリケーションから接続テストを実行します：

```bash
node mcp-connect-test.js
```

以下のような出力が表示されれば成功です：

```
Supabase接続に成功しました！
MCPテーブル接続成功！レコード数: 0
テストメッセージを送信しました。
MCPサーバーとの接続テストに成功しました！
```

## トラブルシューティング

### エラー: テーブルが存在しない

以下のようなエラーが表示される場合：

```
MCPテーブル接続エラー: { message: 'relation "public.mcp_messages" does not exist' }
```

手順4のSQLを再実行してテーブルを作成してください。

### エラー: 権限がない

以下のようなエラーが表示される場合：

```
permission denied for table mcp_messages
```

手順4のSQLでアクセス権限の設定を確認してください。

## 補足情報

### MCPサーバーについて

MCPサーバーは、クライアントとサーバー間の通信を効率化するためのプロトコルです。Supabaseをバックエンドとして使用することで、リアルタイムなデータ同期が可能になります。

### セキュリティについて

本設定では、匿名ユーザーがメッセージの挿入と閲覧を行えるようになっています。本番環境では、より厳格なセキュリティポリシーを検討してください。 