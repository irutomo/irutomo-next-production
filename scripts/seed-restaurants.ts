/**
 * レストランのサンプルデータをSupabaseに挿入するスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../lib/database.types';

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

// Supabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

console.log('クラウドSupabaseに接続します:', supabaseUrl);
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// サンプルレストランデータ
const sampleRestaurants = [
  {
    name: '寿司 匠',
    japanese_name: '寿司 匠',
    english_address: '1-2-3 Ginza, Chuo-ku, Tokyo',
    address: '東京都中央区銀座1-2-3',
    korean_address: '도쿄도 중앙구 긴자 1-2-3',
    phone_number: '03-1234-5678',
    email: 'info@sushi-takumi.example.com',
    description: '最高級の素材を使用した江戸前寿司を提供しています。職人の技と伝統が織りなす極上の味わいをお楽しみください。',
    korean_description: '최고급 재료를 사용한 에도마에 스시를 제공합니다. 장인의 기술과 전통이 빚어내는 최상의 맛을 즐겨보세요.',
    korean_name: '스시 다쿠미',
    cuisine: 'japanese',
    location: 'tokyo',
    rating: 4.8,
    price_range: '高級',
    opening_hours: '12:00-14:00, 17:00-22:00',
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      'https://images.unsplash.com/photo-1534465151540-67b63d4343e0',
      'https://images.unsplash.com/photo-1553621042-f6e147245754'
    ]),
    google_maps_link: 'https://goo.gl/maps/example1',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: true
  },
  {
    name: '炭火焼肉 大和',
    japanese_name: '炭火焼肉 大和',
    english_address: '4-5-6 Shinjuku, Shinjuku-ku, Tokyo',
    address: '東京都新宿区新宿4-5-6',
    korean_address: '도쿄도 신주쿠구 신주쿠 4-5-6',
    phone_number: '03-2345-6789',
    email: 'info@yakiniku-yamato.example.com',
    description: '厳選された和牛を炭火で丁寧に焼き上げる本格焼肉店。特製のタレと共に、肉の旨味を存分にお楽しみいただけます。',
    korean_description: '엄선된 와규를 숯불에서 정성껏 구워내는 정통 야키니쿠 전문점. 특제 소스와 함께 고기의 풍미를 마음껏 즐기실 수 있습니다.',
    korean_name: '숯불 야키니쿠 야마토',
    cuisine: 'yakiniku',
    location: 'tokyo',
    rating: 4.6,
    price_range: '中級',
    opening_hours: '17:00-23:00',
    image_url: 'https://images.unsplash.com/photo-1511689675244-ef3507343b97',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1511689675244-ef3507343b97',
      'https://images.unsplash.com/photo-1646343251395-a316999584fd',
      'https://images.unsplash.com/photo-1676037150304-e4c4a1d585f7'
    ]),
    google_maps_link: 'https://goo.gl/maps/example2',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false
  },
  {
    name: 'たこ焼き 大阪屋',
    japanese_name: 'たこ焼き 大阪屋',
    english_address: '2-3-4 Dotonbori, Chuo-ku, Osaka',
    address: '大阪府大阪市中央区道頓堀2-3-4',
    korean_address: '오사카부 오사카시 중앙구 도톤보리 2-3-4',
    phone_number: '06-1234-5678',
    email: 'info@takoyaki-osakaya.example.com',
    description: '創業50年の老舗たこ焼き屋。厳選された素材と秘伝のダシで作る本場大阪のたこ焼きをお楽しみください。',
    korean_description: '창업 50년의 노포 타코야키 가게. 엄선된 재료와 비법 육수로 만드는 본고장 오사카의 타코야키를 즐겨보세요.',
    korean_name: '타코야키 오사카야',
    cuisine: 'osaka',
    location: 'osaka',
    rating: 4.5,
    price_range: '低価格',
    opening_hours: '11:00-22:00',
    image_url: 'https://images.unsplash.com/photo-1584349308072-c08ad0f3a1a8',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1584349308072-c08ad0f3a1a8',
      'https://images.unsplash.com/photo-1635146037526-1df51ed6db6c',
      'https://images.unsplash.com/photo-1617196701537-7329482cc9fe'
    ]),
    google_maps_link: 'https://goo.gl/maps/example3',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: false,
    has_japanese_menu: true,
    phone_reservation_required: false
  }
];

// データの挿入処理
async function seedRestaurants() {
  try {
    // onConflictを使わず、通常のinsertを使用
    const { data, error } = await supabase
      .from('restaurants')
      .insert(sampleRestaurants)
      .select();
    
    if (error) {
      console.error('データの挿入中にエラーが発生しました:', error);
      return;
    }
    
    console.log(`${data.length}件のレストランデータを追加しました:`, data.map(r => r.name));
  } catch (error) {
    console.error('スクリプトの実行中にエラーが発生しました:', error);
  }
}

// スクリプトの実行
seedRestaurants(); 