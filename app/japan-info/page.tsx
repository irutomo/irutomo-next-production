// サーバーコンポーネント
import { createClient } from '@supabase/supabase-js';
// JapanInfoClientのインポートを削除しました
import { JapanInfo } from '@/types/japan-info';
import { Metadata } from 'next';
import JapanInfoClient from './components/japan-info-client';

export const metadata: Metadata = {
  title: '일본 여행 정보 | 이루토모',
  description: '일본 여행에 필요한 여행 정보와 팁을 확인해 보세요. 도쿄, 오사카, 교토 등 인기 여행지의 정보를 제공합니다.',
  keywords: ['일본 여행 정보', '일본 여행 팁', '도쿄 여행', '오사카 여행', '교토 여행', '일본 관광'],
};

// 日本情報をSupabaseから取得する関数
async function getJapanInfoList(language: 'ja' | 'ko' = 'ko'): Promise<JapanInfo[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // 匿名キーでSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // japan_infoテーブルからデータを取得
    const { data, error } = await supabase
      .from('japan_info')
      .select('*')
      .order('is_popular', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabaseからのデータ取得エラー:', error);
      return [];
    }
    
    // データ型の変換と返却（言語に応じてタイトルと説明を切り替え）
    return data.map(item => ({
      id: item.id.toString(),
      title: language === 'ko' ? (item.korean_title || item.title) : item.title,
      korean_title: item.korean_title,
      description: language === 'ko' ? (item.korean_description || item.description) : item.description,
      korean_description: item.korean_description,
      image_url: item.image_url,
      images: item.images,
      content: item.content,
      korean_content: item.korean_content,
      tags: item.tags,
      location: item.location,
      is_popular: item.is_popular,
      published_at: item.published_at ? new Date(item.published_at).toISOString().split('T')[0] : undefined,
      updated_at: item.updated_at ? new Date(item.updated_at).toISOString().split('T')[0] : undefined,
      author: item.author,
      views: item.views,
      embed_links: item.embed_links
    }));
  } catch (error) {
    console.error('日本情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

// サーバーコンポーネントとしてページを実装
export default async function JapanInfoPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // URLパラメータから言語設定を取得（例: /japan-info?lang=ko）
  // 有効な値は'ja'または'ko'のみ、それ以外は'ja'を使用
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams?.lang || '';
  const language = (typeof lang === 'string' && lang === 'ko' ? 'ko' : 'ja') as 'ja' | 'ko';
  // サーバーサイドでデータを取得
  const japanInfoList = await getJapanInfoList(language as 'ja' | 'ko');
  
  return (
    <div className="min-h-screen">
      <JapanInfoClient japanInfoList={japanInfoList} />
    </div>
  );
}