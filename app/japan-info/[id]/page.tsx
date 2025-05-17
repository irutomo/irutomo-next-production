import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { JapanInfo } from '@/types/japan-info';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';
import { CalendarIcon, MapPinIcon, TagIcon, Share2Icon } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import JapanInfoDetailClient from './components/japan-info-detail-client';
import { cookies } from 'next/headers';
import { getJapanInfoArticleById } from '@/lib/strapi/client';

// 型定義
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// フォールバック用のダミー日本情報を返す関数
function getFallbackJapanInfo(id: string): JapanInfo {
  // ダミーデータ
  return {
    id: id,
    title: '東京観光ガイド',
    korean_title: '도쿄 관광 가이드',
    description: '東京の魅力的な観光スポットを紹介します。',
    korean_description: '도쿄의 매력적인 관광 명소를 소개합니다.',
    content: `# 東京観光ガイド

東京は日本の首都であり、現代的な高層ビルと伝統的な寺社仏閣が共存する魅力的な都市です。

## おすすめスポット

- **東京スカイツリー**: 634mの高さを誇る電波塔で、展望デッキからは東京の絶景が楽しめます。
- **浅草寺**: 東京最古の寺院で、雷門と仲見世通りが有名です。
- **新宿御苑**: 都心にありながら広大な日本庭園を持つ公園です。

## グルメ情報

東京は世界有数の美食都市。ミシュラン星付きレストランから庶民的な屋台まで、多様な食文化を楽しめます。`,
    korean_content: `# 도쿄 관광 가이드

도쿄는 일본의 수도이며, 현대적인 고층 빌딩과 전통적인 사찰이 공존하는 매력적인 도시입니다.

## 추천 명소

- **도쿄 스카이트리**: 634m 높이의 전파탑으로, 전망대에서는 도쿄의 절경을 즐길 수 있습니다.
- **아사쿠사 절**: 도쿄에서 가장 오래된 사찰로, 번개문과 나카미세 거리가 유명합니다.
- **신주쿠 교엔**: 도심에 위치하면서도 넓은 일본 정원을 가진 공원입니다.

## 맛집 정보

도쿄는 세계적인 미식 도시입니다. 미슐랭 스타 레스토랑부터 서민적인 포장마차까지 다양한 식문화를 즐길 수 있습니다.`,
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dG9reW98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    tags: ['東京', '観光', '旅行'],
    location: '東京',
    published_at: '2023-10-01',
    language: 'ja'
  };
}

// Supabaseから指定したIDの日本情報を取得
export async function getJapanInfo(id: string, language: string = 'ko'): Promise<JapanInfo | null> {
  try {
    console.log(`日本情報取得開始: ID=${id}, 言語=${language}`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return getFallbackJapanInfo(id);
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // まず言語フィルタなしでデータ取得を試みる
    let query = supabase
      .from('japan_info')
      .select('*')
      .eq('id', id);
      
    console.log('クエリ実行中...');
    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('日本情報取得エラー:', JSON.stringify(error));
      return getFallbackJapanInfo(id);
    }
    
    if (!data) {
      console.warn(`ID=${id}の日本情報が見つかりません。フォールバックデータを使用します。`);
      return getFallbackJapanInfo(id);
    }
    
    console.log('日本情報取得成功:', data.id);
    
    // データを返す前に言語に基づいてフィールドを選択
    return data;
  } catch (error) {
    console.error('getJapanInfo関数内でエラーが発生しました:', error);
    return getFallbackJapanInfo(id);
  }
}

// メタデータ生成
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;
  // クッキーから言語設定を取得
  try {
    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'ko';
    
    const info = await getJapanInfo(id, language);

    if (!info) {
      return {
        title: language === 'ko' 
          ? '정보를 찾을 수 없습니다 | 이루토모' 
          : '情報が見つかりません | IRUTOMO',
        description: language === 'ko'
          ? '요청하신 일본 여행 정보를 찾을 수 없습니다.'
          : 'リクエストされた日本旅行情報が見つかりませんでした。',
      };
    }

    const title = language === 'ko' ? info.korean_title || info.title : info.title;
    const description = language === 'ko' ? info.korean_description || info.description : info.description;

    return {
      title: language === 'ko'
        ? `${title} | 이루토모 - 일본 여행 정보`
        : `${title} | IRUTOMO - 日本旅行情報`,
      description: description,
      keywords: info.tags || (language === 'ko' ? ['일본 여행'] : ['日本旅行']),
      openGraph: {
        title: language === 'ko' ? (info.korean_title || info.title) : info.title,
        description: language === 'ko' ? (info.korean_description || info.description) : info.description,
        images: [info.image_url],
      },
    };
  } catch (error) {
    console.error('メタデータ生成エラー:', error);
    return {
      title: '일본 여행 정보 | 이루토모',
      description: '일본 여행에 대한 유용한 정보를 제공합니다.',
    };
  }
}

// Supabaseから日本情報を取得する関数
async function getJapanInfoFromSupabase(id: string, language: 'ja' | 'ko' = 'ko') {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // 匿名キーでSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // japan_infoテーブルから指定IDのデータを取得
    const { data, error } = await supabase
      .from('japan_info')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabaseからのデータ取得エラー:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // データ型の変換と返却（言語に応じてタイトルと説明を切り替え）
    return {
      id: data.id.toString(),
      title: language === 'ko' ? (data.korean_title || data.title) : data.title,
      korean_title: data.korean_title,
      description: language === 'ko' ? (data.korean_description || data.description) : data.description,
      korean_description: data.korean_description,
      image_url: data.image_url,
      images: data.images,
      content: language === 'ko' ? (data.korean_content || data.content) : data.content,
      korean_content: data.korean_content,
      tags: data.tags,
      location: data.location,
      is_popular: data.is_popular,
      published_at: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : undefined,
      author: data.author,
      views: data.views,
      embed_links: data.embed_links
    };
  } catch (error) {
    console.error('日本情報の取得中にエラーが発生しました:', error);
    return null;
  }
}

// SupabaseとStrapiから日本情報を取得して統合する関数
async function getJapanInfoById(id: string, language: 'ja' | 'ko' = 'ko') {
  try {
    // まずSupabaseからデータを取得
    const supabaseData = await getJapanInfoFromSupabase(id, language);
    
    // Strapiからデータを取得
    console.log(`Strapiからデータを取得 (ID: ${id})...`);
    const strapiData = await getJapanInfoArticleById(id);
    
    // Strapiからデータが取得できた場合
    if (strapiData) {
      console.log('Strapiからデータを取得しました');
      
      // 言語に応じてデータを加工
      return {
        ...strapiData,
        title: language === 'ko' ? (strapiData.korean_title || strapiData.title) : strapiData.title,
        description: language === 'ko' ? (strapiData.korean_description || strapiData.description) : strapiData.description,
        content: language === 'ko' ? (strapiData.korean_content || strapiData.content) : strapiData.content,
      };
    }
    
    // Strapiからデータが取得できない場合はSupabaseのデータを返す
    return supabaseData;
  } catch (error) {
    console.error('Strapi/Supabaseからのデータ統合中にエラーが発生しました:', error);
    // エラー時はSupabaseだけを試す
    return getJapanInfoFromSupabase(id, language);
  }
}

// サーバーコンポーネントとしてページを実装
export default async function JapanInfoDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // URLパラメータから言語設定を取得（例: /japan-info/1?lang=ko）
  // 有効な値は'ja'または'ko'のみ、それ以外は'ko'をデフォルトとする
  const lang = searchParams?.lang || '';
  const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
  
  // サーバーサイドでデータを取得
  const japanInfo = await getJapanInfoById(params.id, language);
  
  // データが見つからない場合はリダイレクト
  if (!japanInfo) {
    redirect('/japan-info');
  }
  
  return (
    <div className="min-h-screen">
      <JapanInfoDetailClient japanInfo={japanInfo} />
    </div>
  );
} 