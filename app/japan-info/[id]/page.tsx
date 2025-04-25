import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { JapanInfo } from '@/types/japan-info';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';
import { CalendarIcon, MapPinIcon, TagIcon, Share2Icon } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import JapanInfoDetailClient from './components/japan-info-detail-client';
import { cookies } from 'next/headers';

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
    };
  } catch (error) {
    console.error('メタデータ生成エラー:', error);
    return {
      title: '일본 여행 정보 | 이루토모',
      description: '일본 여행에 대한 유용한 정보를 제공합니다.',
    };
  }
}

// 日本情報詳細ページ (サーバーコンポーネント)
export default async function JapanInfoDetailPage({ params }: Props) {
  const { id } = params;
  console.log(`日本情報詳細ページ表示: ID=${id}`);
  
  try {
    // クッキーから言語設定を取得
    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'ko';
    console.log(`使用言語: ${language}`);
    
    const info = await getJapanInfo(id, language);

    if (!info) {
      console.error(`ID=${id}の日本情報が見つかりません。404エラーを返します。`);
      notFound();
    }

    console.log(`日本情報取得成功: ${info.title}`);
    // 言語はクライアントコンポーネントで切り替えるため、渡す
    return <JapanInfoDetailClient info={info} language={language as 'ja' | 'ko'} />;
  } catch (error) {
    console.error('日本情報詳細ページの表示エラー:', error);
    notFound();
  }
} 