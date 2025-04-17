// レストランデータをSupabaseに追加するスクリプト
require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

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
    name: '万豚記 京都錦小路',
    address: '京都府京都市中京区西魚屋町594',
    korean_address: '교토부 교토시 중경구 서우오야초 594',
    english_address: '594 Nishi-Uoya-cho, Nakagyo-ku, Kyoto-shi, Kyoto-fu 604-8064, Japan',
    phone_number: '075-211-3120',
    description: '万豚記。豚の縁起物。豚バラ青菜炒飯がおすすめ。',
    korean_description: '만주지. 돼지의 길조. 돼지고기와 야채 볶음밥이 추천됩니다.',
    japanese_name: '万豚記 京都錦小路',
    korean_name: '만주지 교토 닛시키코지',
    cuisine: '中華',
    korean_cuisine: '중국 요리',
    location: '京都 中京区 錦小路',
    rating: 3.22,
    price_range: '적당한 가격',
    opening_hours: '11:30〜22:00',
    google_maps_link: 'https://www.google.com/maps/search/?api=1&query=京都府京都市中京区西魚屋町594',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: '酒呑気 びんご',
    address: '京都府京都市中京区西錦小路町266-1',
    korean_address: '교토부 교토시 중경구 서니시키코지초 266-1',
    english_address: '266-1 Nishijin-koji-cho, Nakagyo-ku, Kyoto-shi, Kyoto-fu 604-8064, Japan',
    phone_number: '075-748-1499',
    description: 'MZ世代から人気の京都の人気居酒屋！日本現地人の雰囲気を味わえるのでおすすめ',
    korean_description: 'MZ세대로부터 인기있는 교토의 인기 선술집! 일본 현지인의 분위기를 느낄 수 있어 추천',
    japanese_name: '酒呑気 びんご',
    korean_name: '사케노끼 빙고',
    cuisine: '居酒屋',
    korean_cuisine: '이자카야',
    location: '京都 中京区 錦小路',
    rating: 3.62,
    price_range: '적당한 가격',
    opening_hours: '16:00〜24:00',
    google_maps_link: 'https://maps.app.goo.gl/orBCGb1LWE9gy7Js8?g_st=com.google.maps.preview.copy',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: false,
    is_active: true
  },
  {
    name: '三嶋亭 本店',
    address: '京都府京都市中京区桜之町405',
    korean_address: '교토부 교토시 중경구 사쿠라노초 405',
    english_address: '405 Sakura-no-cho, Nakagyo-ku, Kyoto-shi, Kyoto-fu 604-8035, Japan',
    phone_number: '075-221-0003',
    description: '明治の風情を今に伝える老舗すき焼き店',
    korean_description: '메이지 시대의 분위기를 전하는 전통 스키야키 레스토랑',
    japanese_name: '三嶋亭 本店',
    korean_name: '미시마테이 본점',
    cuisine: 'すき焼き',
    korean_cuisine: '스키야키',
    location: '京都 中京区 桜之町',
    rating: 3.67,
    price_range: '고급 식당',
    opening_hours: '11:00〜20:30',
    google_maps_link: 'https://maps.app.goo.gl/V8R7rv6adrjuJep67?g_st=com.google.maps.preview.copy',
    has_vegetarian_options: false,
    has_english_menu: true,
    has_korean_menu: true,
    has_japanese_menu: true,
    phone_reservation_required: true,
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

// 管理者として実行する関数（RLSの制約を回避）
async function addRestaurantsAsAdmin(restaurantsToAdd) {
  try {
    if (restaurantsToAdd.length === 0) {
      console.log('追加するレストランはありません。');
      return;
    }
    
    console.log(`管理者権限で${restaurantsToAdd.length}件のレストランデータを追加します...`);
    
    // サービスロールを使用してRLS制約をバイパス
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('サービスロールキーが設定されていません。通常の挿入を試みます。');
      await addRestaurants(restaurantsToAdd);
      return;
    }
    
    // サービスロールで新しいクライアントを作成
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );
    
    // 一括挿入（サービスロールでRLSをバイパス）
    const { data, error } = await adminSupabase
      .from('restaurants')
      .insert(restaurantsToAdd)
      .select();
    
    if (error) {
      console.error('管理者権限でのレストラン追加エラー:', error);
      console.log('通常の挿入を試みます...');
      await addRestaurants(restaurantsToAdd);
      return;
    }
    
    console.log(`管理者権限で${data.length}件のレストランデータが正常に追加されました！`);
    console.log('追加されたレストラン:');
    data.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} (ID: ${restaurant.id})`);
    });
  } catch (error) {
    console.error('管理者実行エラー:', error);
    console.log('通常の挿入を試みます...');
    await addRestaurants(restaurantsToAdd);
  }
}

// テーブル構造の確認（RESTで直接呼び出し）
async function checkTableStructure() {
  try {
    console.log('RESTを使用してテーブル構造を確認します...');
    
    // Supabase REST APIを使用して1件取得
    const headers = {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
    
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/restaurants?select=*&limit=1`;
    
    const response = await axios.get(url, { headers });
    
    if (response.status !== 200) {
      console.error('テーブル構造確認エラー:', response.statusText);
      return false;
    }
    
    const data = response.data;
    
    if (data && data.length > 0) {
      console.log('現在のレストランテーブル構造:');
      const sample = data[0];
      const fields = Object.keys(sample);
      fields.forEach(field => {
        const value = sample[field];
        const type = typeof value;
        console.log(`- ${field}: ${type} ${value !== null ? `(例: ${JSON.stringify(value)})` : '(null)'}`);
      });
      return true;
    } else {
      console.log('レストランテーブルは空です。構造が確認できませんでしたが、処理を続行します。');
      return true; // テーブルは存在するが空
    }
  } catch (error) {
    console.error('テーブル構造確認中のエラー:', error.message || error);
    console.log('エラーが発生しましたが、既定の構造でデータ挿入を試みます...');
    return true; // エラーが出ても続行
  }
}

// SQL実行関数（Row Level Securityバイパス用）
async function executeSQL(sql) {
  try {
    // サービスロールキーを確認
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('サービスロールキーが設定されていません。SQL実行をスキップします。');
      return false;
    }
    
    // REST APIで直接SQLを実行
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`;
    const headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    const response = await axios.post(url, { sql }, { headers });
    
    if (response.status === 200) {
      console.log('SQL実行成功:', response.data);
      return true;
    } else {
      console.error('SQL実行エラー:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('SQL実行中のエラー:', error.message || error);
    return false;
  }
}

// RLSポリシーを一時的に無効化するSQL
const disableRLSSQL = `
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
`;

// RLSポリシーを再度有効化するSQL
const enableRLSSQL = `
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
`;

// メイン実行関数
async function main() {
  try {
    // レストランテーブルの構造確認
    const structureOk = await checkTableStructure();
    
    if (!structureOk) {
      console.log('レストランテーブルの構造確認に失敗しました。処理を中止します。');
      return;
    }
    
    // 登録前のレストラン数を確認
    try {
      const { count, error } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('レストラン数取得エラー:', error);
      } else {
        console.log(`現在のレストラン数: ${count}件`);
      }
    } catch (error) {
      console.error('レストラン数取得中のエラー:', error);
      console.log('処理を続行します...');
    }
    
    // 既存レストランの確認
    const existingNames = await checkExistingRestaurants();
    
    // 新しいレストランのみをフィルタリング
    const newRestaurants = filterNewRestaurants(existingNames);
    
    if (newRestaurants.length === 0) {
      console.log('追加するレストランはありません。全てのレストランは既に存在します。');
      return;
    }
    
    // ユーザーに確認
    console.log('以下のレストランを追加します:');
    newRestaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} - ${restaurant.cuisine}`);
    });
    console.log('\n続行するには、スクリプトの実行を継続してください...');
    
    // レストラン追加実行（1つの方法のみを使用）
    console.log('レストラン追加を試みます...');
    
    // 管理者権限で挿入（重複防止のため、1つの方法のみを使用）
    await addRestaurantsAsAdmin(newRestaurants);
    
    // 登録後のレストラン数を確認
    try {
      const { count, error } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('更新後レストラン数取得エラー:', error);
      } else {
        console.log(`処理完了後のレストラン数: ${count}件`);
      }
    } catch (error) {
      console.error('更新後レストラン数取得エラー:', error);
    }
    
    console.log('処理が完了しました。');
  } catch (error) {
    console.error('メイン処理エラー:', error);
  }
}

// スクリプト実行
main().catch(err => {
  console.error('スクリプト実行中にエラーが発生しました:', err);
  process.exit(1);
}); 