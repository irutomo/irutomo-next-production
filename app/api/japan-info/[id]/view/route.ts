import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Strapiで閲覧数をインクリメント（メイン）
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const strapiResponse = await fetch(`${strapiUrl}/api/japan-info-articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            views: { $inc: 1 } // Strapiのincrement操作
          }
        })
      });
      
      if (strapiResponse.ok) {
        const data = await strapiResponse.json();
        return NextResponse.json({ 
          success: true, 
          views: data.data?.attributes?.views || 0,
          source: 'strapi'
        });
      }
    } catch (strapiError) {
      console.warn('Strapi閲覧数更新失敗、Supabaseフォールバックを試行:', strapiError);
    }
    
    // Supabaseフォールバック
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
    
    return NextResponse.json({ 
      success: true, 
      views: newViews,
      source: 'supabase'
    });
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 