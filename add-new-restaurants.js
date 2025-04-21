// レストランデータをSupabaseに追加するスクリプト
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

// 追加するレストランデータ
const restaurants = [
  {
    name: "囲炉裏 三九",
    address: "東京都目黒区東山3丁目1-7 スウィフト東山 102",
    korean_address: "도쿄도 메구로구 히가시야마 3초메 1-7 스위프트 히가시야마 102",
    english_address: "Swift Higashiyama 102, 3-1-7 Higashiyama, Meguro-ku, Tokyo 153-0043, Japan",
    phone_number: "03-6883-2139",
    description: "囲炉裏で楽しむ原始焼きとおばんざい",
    korean_description: "화로에서 즐기는 원시구이와 오반자이",
    japanese_name: "囲炉裏 三九",
    korean_name: "화로 삼구",
    cuisine: "居酒屋",
    korean_cuisine: "이자카야",
    location: "東京 目黒区 東山",
    rating: 3.37,
    price_range: "중급 가격",
    opening_hours: "17:00〜21:30",
    image_url: "/images/restaurants/irori-sanku_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/irori-sanku_1.jpg",
      "/images/restaurants/irori-sanku_2.jpg",
      "/images/restaurants/irori-sanku_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=東京都目黒区東山3丁目1-7",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "ブルー・ザ・スリー",
    address: "東京都港区南青山3-10-40",
    korean_address: "도쿄도 미나토구 미나미아오야마 3-10-40",
    english_address: "3-10-40 Minamiaoyama, Minato-ku, Tokyo 107-0062, Japan",
    phone_number: "03-6447-4555",
    description: "表参道の本格中華エスニック居酒屋",
    korean_description: "오모테산도의 본격 중화 에스닉 이자카야",
    japanese_name: "ブルー・ザ・スリー",
    korean_name: "블루 더 쓰리",
    cuisine: "中華居酒屋",
    korean_cuisine: "중화이자카야",
    location: "東京 港区 南青山",
    rating: 3.95,
    price_range: "중급 가격",
    opening_hours: "11:30〜23:30",
    image_url: "/images/restaurants/blue-three_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/blue-three_1.jpg",
      "/images/restaurants/blue-three_2.jpg",
      "/images/restaurants/blue-three_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/BZt7G8SVMwhMbmxCA",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "串若丸",
    address: "東京都目黒区上目黒1-19-2",
    korean_address: "도쿄도 메구로구 가미메구로 1-19-2",
    english_address: "1-19-2 Kamimeguro, Meguro-ku, Tokyo 153-0051, Japan",
    phone_number: "03-3715-9292",
    description: "中目黒の人気焼き鳥居酒屋",
    korean_description: "나카메구로의 인기 꼬치구이 이자카야",
    japanese_name: "串若丸",
    korean_name: "꼬치와카마루",
    cuisine: "居酒屋",
    korean_cuisine: "이자카야",
    location: "東京 目黒区 上目黒",
    rating: 3.55,
    price_range: "중급 가격",
    opening_hours: "17:00〜23:00",
    image_url: "/images/restaurants/kushi-wakamaru_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/kushi-wakamaru_1.jpg",
      "/images/restaurants/kushi-wakamaru_2.jpg",
      "/images/restaurants/kushi-wakamaru_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/bX7MM7yGkR74BJrKA",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "極楽酒場 げんてん",
    address: "東京都渋谷区道玄坂1-13-6 斎藤ビル1階",
    korean_address: "도쿄도 시부야구 도겐자카 1-13-6 사이토 빌딩 1층",
    english_address: "Saito Building 1F, 1-13-6 Dogenzaka, Shibuya-ku, Tokyo 150-0043, Japan",
    phone_number: "03-5456-4420",
    description: "渋谷の屋台風大衆酒場。ライブ感抜群",
    korean_description: "시부야의 포장마차 스타일 대중 술집. 라이브감 최고",
    japanese_name: "極楽酒場 げんてん",
    korean_name: "극락술집 겐텐",
    cuisine: "創作居酒屋",
    korean_cuisine: "창작이자카야",
    location: "東京 渋谷区 道玄坂",
    rating: 3.46,
    price_range: "중급 가격",
    opening_hours: "17:30〜24:00",
    image_url: "/images/restaurants/gokurakusakaba-genten_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/gokurakusakaba-genten_1.jpg",
      "/images/restaurants/gokurakusakaba-genten_2.jpg",
      "/images/restaurants/gokurakusakaba-genten_3.jpg"
    ]),
    google_maps_link: "https://www.google.com/maps/search/?api=1&query=東京都渋谷区道玄坂1-13-6",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "あわよくばあー 渋谷",
    address: "東京都渋谷区道玄坂1-4-19 渋谷マークシティ 1F",
    korean_address: "도쿄도 시부야구 도겐자카 1-4-19 시부야 마크 시티 1층",
    english_address: "Shibuya Mark City 1F, 1-4-19 Dogenzaka, Shibuya-ku, Tokyo 150-0043, Japan",
    phone_number: "03-5459-1837",
    description: "渋谷の活気ある創作居酒屋",
    korean_description: "시부야의 활기찬 창작 이자카야",
    japanese_name: "あわよくばあー 渋谷",
    korean_name: "아와요쿠바 시부야",
    cuisine: "創作居酒屋",
    korean_cuisine: "창작이자카야",
    location: "東京 渋谷区 道玄坂",
    rating: 3.41,
    price_range: "적당한 가격",
    opening_hours: "17:00〜23:00",
    image_url: "/images/restaurants/awayokuba-shibuya_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/awayokuba-shibuya_1.jpg",
      "/images/restaurants/awayokuba-shibuya_2.jpg",
      "/images/restaurants/awayokuba-shibuya_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/zQC2kGZndPpMnEjZ6",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "洋食堂 葡萄",
    address: "東京都中野区中野3-36-4",
    korean_address: "도쿄도 나카노구 나카노 3-36-4",
    english_address: "3-36-4 Nakano, Nakano-ku, Tokyo 164-0001, Japan",
    phone_number: "03-6382-6736",
    description: "中野の小皿洋食とワインの名店",
    korean_description: "나카노의 소량洋식과 와인 명점",
    japanese_name: "洋食堂 葡萄",
    korean_name: "양식당 포도",
    cuisine: "洋食",
    korean_cuisine: "양식",
    location: "東京 中野区 中野",
    rating: 3.63,
    price_range: "고급 식당",
    opening_hours: "16:00〜23:30",
    image_url: "/images/restaurants/yoshokudo-budo_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/yoshokudo-budo_1.jpg",
      "/images/restaurants/yoshokudo-budo_2.jpg",
      "/images/restaurants/yoshokudo-budo_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/ab5vQqG112TJKns17",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "ポップガストロノミー レインカラー",
    address: "東京都目黒区鷹番3-3-14 Roof B1F",
    korean_address: "도쿄도 메구로구 타카반 3-3-14 루프 B1F",
    english_address: "Roof B1F, 3-3-14 Takaban, Meguro-ku, Tokyo 152-0004, Japan",
    phone_number: "03-5708-5512",
    description: "学芸大学の大衆美食居酒屋",
    korean_description: "학예대학의 대중 미식 이자카야",
    japanese_name: "ポップガストロノミー レインカラー",
    korean_name: "팝 가스트로노미 레인컬러",
    cuisine: "ビストロ居酒屋",
    korean_cuisine: "비스트로이자카야",
    location: "東京 目黒区 鷹番",
    rating: 3.47,
    price_range: "중급 가격",
    opening_hours: "17:00〜24:00",
    image_url: "/images/restaurants/pop-gastronomy_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/pop-gastronomy_1.jpg",
      "/images/restaurants/pop-gastronomy_2.jpg",
      "/images/restaurants/pop-gastronomy_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/7AwGvBFXjJxPs6qJ7",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "IGOR COSY 神泉",
    address: "東京都渋谷区円山町18-6 藤田ビル1F",
    korean_address: "도쿄도 시부야구 마루야마초 18-6 후지타 빌딩 1층",
    english_address: "Fujita Building 1F, 18-6 Maruyamacho, Shibuya-ku, Tokyo 150-0044, Japan",
    phone_number: "03-6455-1720",
    description: "神泉の創作焼酎と美食居酒屋",
    korean_description: "신센의 창작소주와 미식 이자카야",
    japanese_name: "IGOR COSY 神泉",
    korean_name: "이고르 코지 신센",
    cuisine: "創作居酒屋",
    korean_cuisine: "창작이자카야",
    location: "東京 渋谷区 円山町",
    rating: 3.46,
    price_range: "중급 가격",
    opening_hours: "17:00〜22:30",
    image_url: "/images/restaurants/igor-cosy_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/igor-cosy_1.jpg",
      "/images/restaurants/igor-cosy_2.jpg",
      "/images/restaurants/igor-cosy_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/cf1oZ2pT9yANKC1J7",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: "かしわビストロ バンバン",
    address: "東京都渋谷区神泉町2-8 小島ハイツ",
    korean_address: "도쿄도 시부야구 신센초 2-8 코지마 하이츠",
    english_address: "Kojima Heights, 2-8 Shinsencho, Shibuya-ku, Tokyo 150-0045, Japan",
    phone_number: "03-6416-4645",
    description: "神泉の近江黒鶏とワインの名店",
    korean_description: "신센의 오미 흑계와 와인 명점",
    japanese_name: "かしわビストロ バンバン",
    korean_name: "카시와 비스트로 반반",
    cuisine: "イタリアンビストロ",
    korean_cuisine: "이탈리안비스트로",
    location: "東京 渋谷区 神泉町",
    rating: 3.55,
    price_range: "중급 가격",
    opening_hours: "17:00〜24:00",
    image_url: "/images/restaurants/kashiwa-bistro_main.jpg",
    images: JSON.stringify([
      "/images/restaurants/kashiwa-bistro_1.jpg",
      "/images/restaurants/kashiwa-bistro_2.jpg",
      "/images/restaurants/kashiwa-bistro_3.jpg"
    ]),
    google_maps_link: "https://maps.app.goo.gl/TRHqEd7UQ8GAX27RA",
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
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
    // テーブル構造の確認
    console.log('レストラン追加処理を開始します...');
    
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