import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('人気レストランAPIリクエスト処理開始');
  
  // 言語設定を取得
  const language = req.cookies.get('language')?.value || 'ja';
  console.log('言語設定:', language);
  
  // 環境変数のチェック
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('環境変数エラー: NEXT_PUBLIC_SUPABASE_URL が設定されていません');
    return NextResponse.json(
      { success: false, message: '環境変数が正しく設定されていません' },
      { status: 500 }
    );
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('環境変数エラー: NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません');
    return NextResponse.json(
      { success: false, message: '環境変数が正しく設定されていません' },
      { status: 500 }
    );
  }
  
  console.log('環境変数チェック完了: URL と ANON_KEY が設定されています');
  
  try {
    // クラウド版Supabaseに直接接続（サービスロールキーではなく匿名キーを使用）
    console.log('Supabaseクライアント作成開始...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    console.log('Supabaseクライアント作成完了');
    
    // 人気レストラン取得クエリ実行
    console.log('人気レストラン取得クエリ実行開始...');
    
    // 指定の3店舗を取得するクエリ
    let { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .or('name.ilike.%鉄鍋餃子 餃子の山崎%,name.ilike.%炭火焼鳥 なかお%,name.ilike.%おでん酒場 湯あみ%')
      .limit(10); // 念のため多めに取得

    if (error) {
      console.error('クエリエラー:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `データ取得失敗: ${error.message}`,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    // データが存在しない場合
    if (!restaurants || restaurants.length === 0) {
      console.log('指定のレストランデータが見つかりませんでした。代替クエリを実行します。');
      
      // 代替としてratingの高い店舗を2件取得
      const { data: fallbackRestaurants, error: fallbackError } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false })
        .limit(2);
        
      if (fallbackError) {
        console.error('代替クエリエラー:', fallbackError);
        return NextResponse.json(
          { success: false, message: `代替データ取得失敗: ${fallbackError.message}` },
          { status: 500 }
        );
      }
      
      if (!fallbackRestaurants || fallbackRestaurants.length === 0) {
        console.log('代替レストランデータも見つかりませんでした');
        return NextResponse.json({
          success: true,
          data: []
        });
      }
      
      console.log('代替データ取得成功:', fallbackRestaurants.length, '件');
      restaurants = fallbackRestaurants;
    } else {
      console.log('指定されたレストランデータ取得成功:', restaurants.length, '件');
      // 必要なら指定の3店舗のみに絞り込む
      const filteredRestaurants = restaurants.filter(r => 
        r.name.includes('鉄鍋餃子 餃子の山崎') || 
        r.name.includes('炭火焼鳥 なかお') ||
        r.name.includes('おでん酒場 湯あみ')
      ).slice(0, 3);
      
      restaurants = filteredRestaurants;
    }
      
    console.log('レストランデータ取得成功:', restaurants.length, '件');
    
    // レストランデータを処理して画像URLを正規化し、言語に応じた情報を設定
    const processedRestaurants = restaurants.map(restaurant => {
      // imagesの処理を安全に行う
      let processedImages = restaurant.images;
      if (restaurant.images) {
        if (typeof restaurant.images === 'string') {
          try {
            if (restaurant.images.startsWith('[') || restaurant.images.startsWith('{')) {
              processedImages = JSON.parse(restaurant.images);
            }
          } catch (e) {
            console.warn(`画像JSONのパースに失敗: ${restaurant.id}, ${e}`);
            processedImages = restaurant.image_url ? [restaurant.image_url] : [];
          }
        }
      } else {
        // imagesがないならimage_urlから配列を作成
        processedImages = restaurant.image_url ? [restaurant.image_url] : [];
      }

      // 言語に応じた情報を設定
      if (language === 'ko') {
        return {
          ...restaurant,
          name: restaurant.korean_name || restaurant.name,
          description: restaurant.korean_description || restaurant.description,
          address: restaurant.korean_address || restaurant.address,
          images: processedImages
        };
      }
      
      return {
        ...restaurant,
        images: processedImages
      };
    });
    
    // デバッグ: 画像URLをログに出力
    if (processedRestaurants && processedRestaurants.length > 0) {
      console.log('レストラン画像情報:');
      processedRestaurants.forEach((restaurant, index) => {
        console.log(`[${index}] ${restaurant.name}: ${restaurant.image_url || 'なし'}`);
        if (restaurant.images) {
          console.log(`  画像情報: ${typeof restaurant.images}`);
          if (Array.isArray(restaurant.images)) {
            console.log(`  画像配列: ${restaurant.images.length}枚`);
          } else if (typeof restaurant.images === 'string') {
            console.log(`  画像文字列: ${restaurant.images}`);
          } else {
            console.log(`  画像オブジェクト: ${JSON.stringify(restaurant.images).substring(0, 100)}...`);
          }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: processedRestaurants
    });
    
  } catch (error) {
    console.error('予期せぬエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 }
    );
  }
}