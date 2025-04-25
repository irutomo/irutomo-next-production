const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// 環境変数をロード
dotenv.config();

// 必要な環境変数の確認
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // 匿名キーに戻す

// 環境変数のチェック
console.log('Supabase環境変数:');
console.log(`URL: ${SUPABASE_URL}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('エラー: Supabase環境変数が設定されていません。');
  console.error('NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを.envファイルに設定してください。');
  process.exit(1);
} else {
  console.log(`ANON_KEY: ${SUPABASE_ANON_KEY ? '正しく設定されています' : '設定されていません'}`);
}

// Supabaseクライアントの作成
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// サンプルデータ
const sampleData = [
  {
    title: '東京観光ガイド：初めての旅行者向け',
    korean_title: '도쿄 관광 가이드: 첫 방문자를 위한',
    description: '東京の主要な観光スポット、美味しい食事処、文化体験をご紹介します。',
    korean_description: '도쿄의 주요 관광 명소, 맛있는 식당, 문화 체험을 소개합니다.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'
    ],
    content: `# 東京観光ガイド

東京は、伝統と革新が共存する魅力的な都市です。初めて訪れる方のために、おすすめのスポットをご紹介します。

## 浅草寺

東京最古の寺院である浅草寺は、雷門からの参道「仲見世通り」と共に有名です。伝統的な日本のお土産を買うのに最適な場所です。

## 東京スカイツリー

634メートルの高さを誇る東京スカイツリーからは、東京の息をのむような景色を楽しむことができます。

## 渋谷スクランブル交差点

世界で最も忙しい横断歩道の一つで、東京の活気を体感できます。

## 美食の街

東京は、ミシュランの星を獲得したレストランが世界で最も多い都市です。日本料理だけでなく、世界中の料理を楽しむことができます。

## 交通アクセス

東京の公共交通機関は非常に発達しており、Suicaやパスモなどのカードを使うと便利です。

## ベストシーズン

東京を訪れるベストシーズンは春（3〜5月）と秋（9〜11月）です。桜や紅葉の季節は特に美しいです。`,
    korean_content: `# 도쿄 관광 가이드

도쿄는 전통과 혁신이 공존하는 매력적인 도시입니다. 처음 방문하는 분들을 위해 추천 명소를 소개합니다.

## 아사쿠사 절

도쿄에서 가장 오래된 사원인 아사쿠사 절은 카미나리몬(번개문)에서 이어지는 '나카미세 거리'와 함께 유명합니다. 전통적인 일본 기념품을 구입하기에 이상적인 장소입니다.

## 도쿄 스카이트리

634미터 높이의 도쿄 스카이트리에서는 도쿄의 멋진 전망을 즐길 수 있습니다.

## 시부야 스크램블 교차로

세계에서 가장 바쁜 횡단보도 중 하나로, 도쿄의 활기를 체험할 수 있습니다.

## 미식의 도시

도쿄는 미슐랭 별을 받은 레스토랑이 세계에서 가장 많은 도시입니다. 일본 요리뿐만 아니라 전 세계 요리를 즐길 수 있습니다.

## 교통 접근성

도쿄의 公共交通機関은 매우 발달되어 있으며, 스이카나 파스모와 같은 카드를 사용하면 편리합니다.

## 베스트 시즌

도쿄를 방문하기 가장 좋은 시기는 봄(3~5월)과 가을(9~11월)입니다. 벚꽃이나 단풍 시즌은 특히 아름답습니다.`,
    tags: ['東京', '観光', '旅行', '日本文化'],
    location: '東京',
    is_popular: true,
    author: '日本旅行ガイド編集部',
    embed_links: {
      youtube: 'https://www.youtube.com/watch?v=sample1',
      instagram: 'https://www.instagram.com/p/sample1'
    }
  },
  {
    title: '京都の隠れた名所：地元民おすすめスポット',
    korean_title: '교토의 숨겨진 명소: 현지인 추천 장소',
    description: '観光客が知らない京都の隠れた名所や、地元の人だけが知るおすすめスポットをご紹介します。',
    korean_description: '관광객이 모르는 교토의 숨겨진 명소와 현지인만 아는 추천 장소를 소개합니다.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186'
    ],
    content: `# 京都の隠れた名所

京都には有名な観光地だけでなく、地元の人だけが知る素晴らしいスポットがたくさんあります。

## 大原三千院の奥の院

有名な三千院ですが、奥の院までは多くの観光客が行きません。静かな雰囲気の中、苔むした庭園を楽しむことができます。

## 鞍馬寺へのハイキング

鞍馬山は比較的観光客が少なく、ハイキングを楽しみながら神聖な雰囲気を味わえます。山頂からの眺めは絶景です。

## 地元の市場

錦市場は有名ですが、地元の人々が通う小さな市場もたくさんあります。新鮮な食材や手作りの品々を見つけることができます。

## 穴場カフェ

京都には歴史的な町家を改装したカフェがたくさんあります。地元の人々が集まる静かなカフェで、本物の京都を感じることができます。

## 季節の祭り

京都には季節ごとに様々な祭りがあります。地元の小さな祭りに参加すると、より親密な京都の文化体験ができます。

## アクセス情報

京都市内は公共交通機関が便利ですが、自転車をレンタルすると隠れた名所を巡るのに最適です。`,
    korean_content: `# 교토의 숨겨진 명소

교토에는 유명한 관광지뿐만 아니라 현지인만 아는 멋진 장소가 많이 있습니다.

## 오하라 산젠인의 오쿠노인

유명한 산젠인이지만, 오쿠노인(안쪽 사원)까지는 많은 관광객이 가지 않습니다. 조용한 분위기 속에서 이끼 낀 정원을 즐길 수 있습니다.

## 쿠라마데라로 하이킹

쿠라마 산은 비교적 관광객이 적고, 하이킹을 즐기면서 신성한 분위기를 맛볼 수 있습니다. 산정상에서의 전망은 절경입니다.

## 현지 시장

니시키 시장은 유명하지만, 현지인들이 다니는 작은 시장도 많이 있습니다. 신선한 식재료나 수제품을 찾을 수 있습니다.

## 숨겨진 카페

교토에는 역사적인 마치야(전통 목조 가옥)를 개조한 카페가 많이 있습니다. 현지인들이 모이는 조용한 카페에서 진정한 교토를 느낄 수 있습니다.

## 계절 축제

교토에는 계절마다 다양한 축제가 있습니다. 현지의 작은 축제에 참가하면 더 친밀한 교토 문화 체험을 할 수 있습니다.

## 접근 정보

교토 시내는 대중교통이 편리하지만, 자전거를 대여하면 숨겨진 명소를 둘러보기에 최적입니다.`,
    tags: ['京都', '穴場', '文化', '観光'],
    location: '京都',
    is_popular: true,
    author: '京都探検家',
    embed_links: {
      youtube: 'https://www.youtube.com/watch?v=sample2',
      instagram: 'https://www.instagram.com/p/sample2'
    }
  },
  {
    title: '大阪のB級グルメ：食い倒れの街を満喫する',
    korean_title: '오사카의 B급 먹거리: 식도락의 도시를 만끽하기',
    description: '「食い倒れの街」として知られる大阪で、絶対に外せないB級グルメスポットを巡ります。',
    korean_description: '\'식도락의 도시\'로 알려진 오사카에서 절대 놓칠 수 없는 B급 먹거리 명소를 소개합니다.',
    image_url: 'https://images.unsplash.com/photo-1546736317-71abb2b0b6c3',
    images: [
      'https://images.unsplash.com/photo-1546736317-71abb2b0b6c3',
      'https://images.unsplash.com/photo-1533326965779-989699c9bb92',
      'https://images.unsplash.com/photo-1575367439058-6096bb9cf5e2'
    ],
    content: `# 大阪のB級グルメガイド

「食い倒れの街」と言われる大阪には、手頃な価格で美味しい食べ物がたくさんあります。

## たこ焼き

大阪の象徴的な食べ物であるたこ焼きは、道頓堀の「くくる」や「わなか」など、人気店で味わうことができます。

## お好み焼き

関西風お好み焼きは、「きじ」や「ふきや」などの老舗店が特におすすめです。

## 串カツ

「だるま」や「新世界串カツいっとく」など、新世界エリアには名店が集まっています。二度づけ禁止のルールを忘れないでください！

## 粉もん横丁

天王寺近くの「粉もん横丁」では、たこ焼き、お好み焼き、焼きそばなどさまざまな粉もん料理を楽しめます。

## 立ち飲み文化

大阪は立ち飲み屋の文化も盛んです。地元の人々と交流しながら、リーズナブルに美味しいお酒と料理を楽しめます。

## 食べ歩きプラン

2〜3日の滞在であれば、道頓堀エリア、天王寺エリア、そして新世界エリアを巡るプランがおすすめです。`,
    korean_content: `# 오사카 B급 먹거리 가이드

'식도락의 도시'라 불리는 오사카에는 저렴한 가격에 맛있는 음식이 많이 있습니다.

## 타코야키

오사카의 상징적인 음식인 타코야키는 도톤보리의 '쿠쿠루'나 '와나카' 등 인기 가게에서 맛볼 수 있습니다.

## 오코노미야키

간사이식 오코노미야키는 '키지'나 '후키야' 등의 오래된 가게가 특히 추천합니다.

## 쿠시카츠

'다루마'나 '신세카이 쿠시카츠 잇토쿠' 등, 신세카이 지역에는 유명 가게가 모여 있습니다. 두 번 찍기 금지 규칙을 잊지 마세요!

## 코나몬 요코초

텐노지 근처의 '코나몬 요코초'에서는 타코야키, 오코노미야키, 야키소바 등 다양한 분말 요리를 즐길 수 있습니다.

## 스탠딩 바 문화

오사카는 스탠딩 바 문화도 활발합니다. 현지인들과 교류하면서 합리적인 가격에 맛있는 술과 요리를 즐길 수 있습니다.

## 식도락 투어 계획

2~3일 체류한다면, 도톤보리 지역, 텐노지 지역, 그리고 신세카이 지역을 돌아보는 계획이 추천합니다.`,
    tags: ['大阪', 'グルメ', 'B級', '食べ歩き'],
    location: '大阪',
    is_popular: true,
    author: '関西グルメ探検隊',
    embed_links: {
      youtube: 'https://www.youtube.com/watch?v=sample3',
      instagram: 'https://www.instagram.com/p/sample3'
    }
  }
];

// Supabase接続テスト
async function testConnection() {
  console.log('Supabase接続テスト...');
  try {
    // レストランテーブルに簡単なクエリを実行して接続テスト
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('Supabase接続エラー:', error);
      return false;
    }
    
    console.log(`Supabase接続に成功しました。restaurants テーブルデータ: ${JSON.stringify(data)}`);
    return true;
  } catch (err) {
    console.error('Supabase接続エラー:', err);
    return false;
  }
}

// テーブルが存在するかチェック
async function checkJapanInfoTableExists() {
  try {
    // japan_infoテーブルにクエリを実行して存在確認
    const { data, error } = await supabase
      .from('japan_info')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('japan_infoテーブル確認エラー:', error);
      return false;
    }
    
    console.log('japan_infoテーブルが存在し、アクセス可能です。');
    return true;
  } catch (err) {
    console.error('テーブル確認中のエラー:', err);
    return false;
  }
}

// サンプルデータを挿入する関数
async function insertSampleData() {
  console.log('サンプルデータを挿入します...');
  try {
    // サンプルデータの挿入
    const { data, error } = await supabase
      .from('japan_info')
      .insert(sampleData)
      .select();
    
    if (error) {
      console.error('サンプルデータ挿入エラー:', error);
      
      // RLSポリシーエラーの場合、特別なメッセージを表示
      if (error.code === '42501' || error.message.includes('row-level security policy')) {
        console.error('\n===== 行レベルセキュリティ(RLS)ポリシーエラー =====');
        console.error('このエラーは、現在のユーザー権限で japan_info テーブルにデータを挿入できないことを示しています。');
        console.error('\n以下のいずれかの方法で解決できます：');
        console.error('1. Supabase管理画面のSQLエディタで以下のSQLを実行して、匿名ユーザーにも挿入権限を付与：');
        console.error(`
CREATE POLICY "Allow anonymous insert access" 
ON public.japan_info
FOR INSERT 
TO anon
USING (true);
        `);
        console.error('2. サービスロールキーを使ってスクリプトを実行する（推奨）');
        console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY の代わりに SUPABASE_SERVICE_ROLE_KEY を使う');
      }
      
      return false;
    }
    
    console.log(`${data.length}件のサンプルデータが正常に挿入されました。`);
    return true;
  } catch (err) {
    console.error('サンプルデータ挿入中のエラー:', err);
    return false;
  }
}

// メイン関数
async function main() {
  console.log('japan_infoデータ挿入スクリプトを開始します...');
  
  // Supabase接続テスト
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Supabaseに接続できませんでした。スクリプトを終了します。');
    process.exit(1);
  }
  
  // japan_infoテーブルの存在チェック
  const tableExists = await checkJapanInfoTableExists();
  
  if (!tableExists) {
    console.error('japan_infoテーブルが存在しません。先にテーブルを作成してください。');
    process.exit(1);
  }
  
  // サンプルデータの挿入
  const dataInserted = await insertSampleData();
  if (!dataInserted) {
    console.error('サンプルデータの挿入に失敗しました。');
    process.exit(1);
  }
  
  console.log('japan_infoデータ挿入スクリプトが完了しました。');
}

// スクリプト実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
}); 