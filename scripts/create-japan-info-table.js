#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase接続情報
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL や SUPABASE_SERVICE_ROLE_KEY を確認してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// japan_infoテーブル作成用のSQL
const createTableSQL = `
-- Create japan_info table
CREATE TABLE IF NOT EXISTS public.japan_info (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    korean_title TEXT,
    description TEXT NOT NULL,
    korean_description TEXT,
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    content TEXT NOT NULL,
    korean_content TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    location TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author TEXT,
    views INTEGER DEFAULT 0,
    embed_links JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.japan_info ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow anonymous users to read japan_info table
CREATE POLICY "Allow anonymous read access" 
ON public.japan_info
FOR SELECT 
USING (true);

-- Allow authenticated users to insert, update, and delete
CREATE POLICY "Allow authenticated users full access" 
ON public.japan_info
USING (auth.role() = 'authenticated');

-- Create index for frequently accessed columns
CREATE INDEX idx_japan_info_tags ON public.japan_info USING GIN (tags);
CREATE INDEX idx_japan_info_is_popular ON public.japan_info (is_popular);
CREATE INDEX idx_japan_info_published_at ON public.japan_info (published_at);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function when a row is updated
CREATE TRIGGER update_japan_info_updated_at
BEFORE UPDATE ON public.japan_info
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.japan_info IS 'Table for storing Japan travel information and blog posts';
COMMENT ON COLUMN public.japan_info.embed_links IS 'JSON object to store external embeds like Instagram, Twitter, YouTube links';
`;

async function createJapanInfoTable() {
  console.log('japan_infoテーブルの作成を開始します...');
  
  try {
    // MCPを使用せず、直接Supabase RPC経由でSQLを実行
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      throw error;
    }
    
    console.log('japan_infoテーブルが正常に作成されました');
    
    // Database型定義の更新が必要な旨を表示
    console.log('\n注意: database.types.tsファイルを更新して、japan_infoテーブルの型定義を追加してください');
    console.log('npx supabase gen types typescript --project-id <project-id> --schema public > lib/database.types.ts');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    
    // サービスロールキーが必要な操作なので、権限エラーの場合はその旨を表示
    if (error.message && error.message.includes('permission denied')) {
      console.error('\nアクセス権限がありません。SUPABASE_SERVICE_ROLE_KEYを使用していることを確認してください。');
    }
    
    // rpc関数が存在しない場合はSQL Editorから実行する方法を案内
    if (error.message && error.message.includes('function exec_sql() does not exist')) {
      console.error('\nSupabaseでexec_sql関数が見つかりません。以下のいずれかの方法を試してください:');
      console.error('1. Supabase SQL Editorから直接上記のSQLを実行する');
      console.error('2. 以下のSQL関数を作成してから再度実行する:');
      console.error(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
    }
  }
}

createJapanInfoTable(); 