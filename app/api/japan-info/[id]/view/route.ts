import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Supabaseクライアントの作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // まず現在の閲覧数を取得
    const { data: currentData, error: fetchError } = await supabase
      .from('japan_info')
      .select('views')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('閲覧数の取得エラー:', fetchError);
      return NextResponse.json(
        { error: '閲覧数の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // 閲覧数をインクリメント
    const currentViews = currentData?.views || 0;
    const newViews = currentViews + 1;
    
    const { error: updateError } = await supabase
      .from('japan_info')
      .update({ views: newViews })
      .eq('id', id);
    
    if (updateError) {
      console.error('閲覧数の更新エラー:', updateError);
      return NextResponse.json(
        { error: '閲覧数の更新に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, views: newViews });
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 