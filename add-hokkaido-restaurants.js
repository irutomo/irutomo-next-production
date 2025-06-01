// 北海道レストランデータをSupabaseに追加するスクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

console.log('Supabase環境変数:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '正しく設定されています' : '設定がありません');

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }
);

// 追加する北海道レストランデータ
const restaurants = [
  {
    name: "ふくろう亭",
    address: "北海道札幌市中央区南八条西5キャピタルＹＭＤビル１Ｆ",
    korean_address: "호카이도 사포로시 중앙구 남팔조 서 5 캐피탈 YMD 빌딩 1F",
    english_address: "Capital YMD Building 1F, Minami 8-jo Nishi 5, Chuo-ku, Sapporo-shi, Hokkaido",
    phone_number: "011-512-6598",
    description: "北海道名物のラム肉の焼き肉の名店！日本語での電話でしか予約できないので外国人は普段なかなかいくことができないよ！",
    korean_description: "홋카이도 명물 양고기 구이 맛집! 일본어로 전화로만 예약할 수 있기 때문에 외국인은 평소에 좀처럼 갈 수 없어!",
    japanese_name: "ふくろう亭",
    korean_name: "부엉이정",
    cuisine: "ジンギスカン",
    korean_cuisine: "진기스칸",
    location: "北海道 札幌 中央区 南八条西",
    rating: 3.63,
    price_range: "중급 가격",
    opening_hours: "17:00〜21:30",
    image_url: "/images/restaurants/hokkaido-fukuroutei_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/hokkaido-fukuroutei_1.jpg",
      "/images/restaurants/hokkaido-fukuroutei_2.jpg",
      "/images/restaurants/hokkaido-fukuroutei_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=Capital+YMD+Building+1F,+Minami+8-jo+Nishi+5,+Chuo-ku,+Sapporo-shi,+Hokkaido",
    has_vegetarian_options: false,
    has_english_menu: false,
    has_korean_menu: false,
    has_japanese_menu: true,
    phone_reservation_required: true,
    is_active: true
  },
  {
    name: "SAPPORO餃子製造所 札幌駅西店",
    address: "北海道札幌市中央区北五条西1-1-1 札幌駅西ビル1F",
    korean_address: "호카이도 사포로시 중앙구 키타고조 니시 1-1-1 사포로 에키 니시 빌딩 1F",
    english_address: "1F Sapporo Eki Nishi Building, Kita 5-jo Nishi 1-1-1, Chuo-ku, Sapporo-shi, Hokkaido",
    phone_number: "011-200-0011",
    description: "札幌駅近くの餃子専門店。こだわりの大粒餃子が自慢。",
    korean_description: "사포로역 근처의 교자 전문점. 독특한 큰 교자가 자랑입니다.",
    japanese_name: "SAPPORO餃子製造所 札幌駅西店",
    korean_name: "사포로 교자 제조소 사포로역 서점",
    cuisine: "餃子",
    korean_cuisine: "교자",
    location: "北海道 札幌 中央区 北五条西",
    rating: 3.55,
    price_range: "적당한 가격",
    opening_hours: "11:00〜23:00",
    image_url: "/images/restaurants/hokkaido-gyoza_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/hokkaido-gyoza_1.jpg",
      "/images/restaurants/hokkaido-gyoza_2.jpg",
      "/images/restaurants/hokkaido-gyoza_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=北海道札幌市中央区北五条西1-1-1",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "STEM",
    address: "北海道札幌市中央区南二条東2-8-1 大都ビル1F",
    korean_address: "호카이도 사포로시 중앙구 남이조동 2-8-1 대도 빌딩 1F",
    english_address: "1F Daito Building, 2-8-1 Minami 2-jo Higashi, Chuo-ku, Sapporo-shi, Hokkaido",
    phone_number: "011-252-7066",
    description: "札幌の隠れ家的イタリアンダイニング。創作料理とワインが楽しめる。",
    korean_description: "사포로의 숨겨진 이탈리안 다이ニング. 창작 요리와 와인을 즐길 수 있습니다.",
    japanese_name: "STEM",
    korean_name: "STEM",
    cuisine: "イタリアン",
    korean_cuisine: "이탈리안",
    location: "北海道 札幌 中央区 南二条東",
    rating: 3.57,
    price_range: "중급 가격",
    opening_hours: "11:00〜24:00 (日曜定休)",
    image_url: "/images/restaurants/hokkaido-stem_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/hokkaido-stem_1.jpg",
      "/images/restaurants/hokkaido-stem_2.jpg",
      "/images/restaurants/hokkaido-stem_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=北海道札幌市中央区南二条東2-8-1",
    has_vegetarian_options: true,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "炉端 酒 勿ノ論",
    address: "北海道札幌市中央区南三条西4-9 カミヤビル7階",
    korean_address: "호카이도 사포로시 중앙구 남삼조 니시 4-9 가미야 빌딩 7층",
    english_address: "7F Kamiya Building, 4-9 Minami 3-jo Nishi, Chuo-ku, Sapporo-shi, Hokkaido",
    phone_number: "011-596-6230",
    description: "札幌の新感覚炉端焼き屋。旬の食材と厳選酒。",
    korean_description: "사포로의 새로운 로바타야키. 계절 음식과 엄선된 술.",
    japanese_name: "炉端 酒 勿ノ論",
    korean_name: "로바타 술 모치노론",
    cuisine: "炉端焼き",
    korean_cuisine: "로바타구이",
    location: "北海道 札幌 中央区 南三条西",
    rating: 3.27,
    price_range: "중급 가격",
    opening_hours: "18:00〜2:00 (火曜定休)",
    image_url: "/images/restaurants/hokkaido-mochinoron_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/hokkaido-mochinoron_1.jpg",
      "/images/restaurants/hokkaido-mochinoron_2.jpg",
      "/images/restaurants/hokkaido-mochinoron_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=北海道札幌市中央区南3条西4-9",
    has_vegetarian_options: false,
    has_english_menu: false,
    has_korean_menu: false,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  }
];

// 既存のレストランを確認する関数
async function checkExistingRestaurants() {
  try {
    console.log('既存のレストランを確認しています...');
    const restaurantNames = restaurants.map(r => r.name);
    
    // レストラン名で既存データを検索
    const { data, error } = await supabase
      .from('restaurants')
      .select('name')
      .in('name', restaurantNames);
    
    if (error) {
      console.error('既存レストラン確認エラー:', error);
      return [];
    }
    
    const existingNames = data.map(r => r.name);
    console.log('既存のレストラン:', existingNames.length > 0 ? existingNames.join(', ') : 'なし');
    
    return existingNames;
  } catch (error) {
    console.error('既存レストラン確認中のエラー:', error);
    return [];
  }
}

// 新しいレストランのみフィルタリングする関数
function filterNewRestaurants(existingNames) {
  const newRestaurants = restaurants.filter(restaurant => !existingNames.includes(restaurant.name));
  
  console.log(`${restaurants.length}件中、${newRestaurants.length}件が新規レストランです。`);
  if (existingNames.length > 0) {
    const duplicateRestaurants = restaurants.filter(restaurant => existingNames.includes(restaurant.name));
    console.log('以下のレストランは既に存在するため、追加をスキップします:');
    duplicateRestaurants.forEach(restaurant => {
      console.log(`- ${restaurant.name}`);
    });
  }
  
  return newRestaurants;
}

// レストランデータを追加する関数
async function addRestaurants(restaurantsToAdd) {
  try {
    if (restaurantsToAdd.length === 0) {
      console.log('追加するレストランはありません。');
      return;
    }
    
    console.log(`${restaurantsToAdd.length}件のレストランデータを追加します...`);
    
    // 一括挿入
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantsToAdd)
      .select();
    
    if (error) {
      console.error('レストラン追加エラー:', error);
      return;
    }
    
    console.log(`${data.length}件のレストランデータが正常に追加されました！`);
    console.log('追加されたレストラン:');
    data.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} (ID: ${restaurant.id})`);
    });
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

// メイン処理
async function main() {
  try {
    console.log('北海道レストラン追加処理を開始します...');
    
    // 既存レストランの確認
    const existingNames = await checkExistingRestaurants();
    
    // 新規レストランのフィルタリング
    const newRestaurants = filterNewRestaurants(existingNames);
    
    // レストランの追加
    await addRestaurants(newRestaurants);
    
    console.log('処理が完了しました！');
  } catch (error) {
    console.error('メイン処理エラー:', error);
  }
}

// スクリプト実行
main(); 