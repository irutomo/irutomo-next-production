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

// 日本情報をSupabaseから直接取得する関数
async function getJapanInfoList(language: 'ja' | 'ko' = 'ko') {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // 匿名キーでSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // とりあえずダミーデータを返す
    // 実際にはSupabaseにjapan_infoテーブルを作成して、そのデータを取得する
    const dummyData: JapanInfo[] = [
      {
        id: '1',
        title: '도쿄 여행 가이드: 현지인이 추천하는 명소 TOP 10',
        korean_title: '도쿄 여행 가이드: 현지인이 추천하는 명소 TOP 10',
        description: '도쿄를 처음 방문하는 여행자를 위한 필수 관광 명소와 현지인이 추천하는 숨겨진 장소들을 소개합니다.',
        korean_description: '도쿄를 처음 방문하는 여행자를 위한 필수 관광 명소와 현지인이 추천하는 숨겨진 장소들을 소개합니다.',
        image_url: '/images/landing-page-image1.jpg',
        tags: ['도쿄', '관광명소', '여행팁'],
        location: '도쿄',
        is_popular: true,
        published_at: '2023-04-15',
        content: `
## 도쿄를 처음 방문하시나요?

도쿄는 현대적인 고층 빌딩과 전통적인 일본 문화가 공존하는 매력적인 도시입니다. 이 가이드에서는 도쿄에서 꼭 방문해야 할 명소 10곳을 소개합니다.

### 1. 시부야 스크램블 교차로

세계에서 가장 분주한 횡단보도로 알려진 이곳은 도쿄의 상징적인 장소입니다. 특히 저녁 시간대에 방문하면 네온사인으로 빛나는 모습이 장관입니다.

### 2. 메이지 신사

도쿄 중심부에 위치한 평화로운 신사로, 아름다운 정원과 울창한 숲으로 둘러싸여 있습니다. 도시의 번잡함에서 벗어나 휴식을 취하기에 완벽한 장소입니다.

### 3. 도쿄 스카이트리

높이 634m의 전파탑으로, 도쿄의 파노라마 전망을 즐길 수 있습니다. 맑은 날에는 후지산까지 볼 수 있습니다.
        `,
      },
      {
        id: '2',
        title: '오사카 먹방 여행: 놓치면 후회할 맛집 추천',
        korean_title: '오사카 먹방 여행: 놓치면 후회할 맛집 추천',
        description: '일본 음식의 도시 오사카에서 반드시 맛봐야 할 음식과 현지 맛집을 소개합니다. 타코야키부터 오코노미야키까지!',
        korean_description: '일본 음식의 도시 오사카에서 반드시 맛봐야 할 음식과 현지 맛집을 소개합니다. 타코야키부터 오코노미야키까지!',
        image_url: '/images/landing-page-image2.jpg',
        tags: ['오사카', '맛집', '음식'],
        location: '오사카',
        is_popular: true,
        published_at: '2023-05-20',
        content: `
## 오사카, 음식의 천국

오사카는 '일본의 부엌'이라고 불릴 정도로 다양하고 맛있는 음식으로 유명합니다. 이 글에서는 오사카에서 꼭 맛봐야 할 음식과 맛집을 소개합니다.

### 1. 타코야키

오사카의 대표적인 길거리 음식인 타코야키는 문어가 들어간 둥근 모양의 반죽 요리입니다. 도톤보리에 있는 '아키보노'에서 맛보세요.

### 2. 오코노미야키

일본식 부침개로, 다양한 재료가 들어갑니다. '미즈노'의 오코노미야키는 100년 이상 된 전통 맛을 느낄 수 있습니다.
        `,
      },
      {
        id: '3',
        title: '교토 여행 완벽 가이드: 천년 도시의 아름다움',
        korean_title: '교토 여행 완벽 가이드: 천년 도시의 아름다움',
        description: '일본의 고대 수도 교토에서 전통 신사, 사원, 정원을 탐험하는 방법. 계절별 방문 팁과 추천 코스.',
        korean_description: '일본의 고대 수도 교토에서 전통 신사, 사원, 정원을 탐험하는 방법. 계절별 방문 팁과 추천 코스.',
        image_url: '/images/landing-page-image3.jpg',
        tags: ['교토', '전통', '사원'],
        location: '교토',
        is_popular: true,
        published_at: '2023-06-10',
        content: `
## 천년의 역사를 간직한 교토

교토는 794년부터 1868년까지 일본의 수도였던 역사적인 도시로, 수많은 전통 사원과 신사, 정원이 있습니다. 이 가이드에서는 교토의 주요 명소와 방문 팁을 소개합니다.

### 1. 기요미즈데라

교토에서 가장 유명한 사원 중 하나로, 절벽 위에 지어진 독특한 구조로 유명합니다. 이곳에서 바라보는 교토 시내 전망이 아름답습니다.

### 2. 후시미 이나리 신사

수천 개의 붉은 도리이 (신사 문)가 산길을 따라 늘어서 있는 모습이 압도적입니다. 사진 촬영에 완벽한 장소입니다.
        `,
      },
      {
        id: '4',
        title: '일본 대중교통 완벽 가이드: 기차, 지하철, 버스 탑승 방법',
        korean_title: '일본 대중교통 완벽 가이드: 기차, 지하철, 버스 탑승 방법',
        description: '일본 여행자를 위한 대중교통 이용 가이드. JR패스, 스이카/파스모 카드 활용법과 기차/지하철 탑승 요령.',
        korean_description: '일본 여행자를 위한 대중교통 이용 가이드. JR패스, 스이카/파스모 카드 활용법과 기차/지하철 탑승 요령.',
        image_url: '/images/landing-page-image4.jpg',
        tags: ['교통', '여행팁', '기차'],
        location: '전국',
        is_popular: false,
        published_at: '2023-07-05',
        content: `
## 일본의 대중교통 시스템 이해하기

일본은 세계에서 가장 효율적이고 정확한 대중교통 시스템을 갖추고 있습니다. 이 가이드에서는 일본 여행자가 알아야 할 대중교통 이용 방법을 소개합니다.

### 1. JR 패스

일본 여행자를 위한 철도 패스로, 대부분의 JR 노선을 무제한으로 이용할 수 있습니다. 일본을 방문하기 전에 자국에서 미리 구매하는 것이 좋습니다.

### 2. IC 카드 (스이카, 파스모)

도쿄와 다른 주요 도시에서 사용할 수 있는 선불 교통카드입니다. 충전해서 기차, 지하철, 버스에 사용할 수 있으며, 편의점이나 자판기에서도 사용 가능합니다.
        `,
      },
      {
        id: '5',
        title: '일본 온천 여행: 지역별 유명 온천과 에티켓',
        korean_title: '일본 온천 여행: 지역별 유명 온천과 에티켓',
        description: '일본 전통 온천(온센) 문화와 주요 온천 지역 소개. 처음 방문자를 위한 온천 이용 방법과 에티켓.',
        korean_description: '일본 전통 온천(온센) 문화와 주요 온천 지역 소개. 처음 방문자를 위한 온천 이용 방법과 에티켓.',
        image_url: '/images/cuisines/default.jpg',
        tags: ['온천', '휴양', '전통'],
        location: '전국',
        is_popular: false,
        published_at: '2023-08-15',
        content: `
## 일본 온천 문화 체험하기

온천(온센)은 일본 문화의 중요한 부분으로, 휴식과 치유의 공간입니다. 이 가이드에서는 일본의 주요 온천 지역과 온천 이용 방법을 소개합니다.

### 1. 하코네

도쿄에서 접근하기 쉬운 인기 온천 지역으로, 다양한 료칸(전통 숙소)과 온천 시설이 있습니다. 특히 후지산 전망이 아름다운 온천이 유명합니다.

### 2. 구사츠

일본 최고의 온천 지역 중 하나로, 녹색의 산성 온천수가 특징입니다. 피부병에 효과가 있다고 알려져 있습니다.
        `,
      }
    ];
    
    return dummyData;
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