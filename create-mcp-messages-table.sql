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