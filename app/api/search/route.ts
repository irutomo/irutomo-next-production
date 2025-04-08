import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/app/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') || '0'
    const maxPrice = searchParams.get('maxPrice') || '100000'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    // ページネーションの計算
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    const supabase = await createServerSupabaseClient()
    
    let supabaseQuery = supabase
      .from('restaurants')
      .select('*, restaurant_categories(*)', { count: 'exact' })
    
    // テキスト検索フィルター
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%, description.ilike.%${query}%`)
    }
    
    // 位置情報フィルター
    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`)
    }
    
    // カテゴリーフィルター
    if (category) {
      supabaseQuery = supabaseQuery.eq('restaurant_categories.category_id', category)
    }
    
    // 価格帯フィルター
    supabaseQuery = supabaseQuery.gte('average_price', minPrice).lte('average_price', maxPrice)
    
    const { data, error, count } = await supabaseQuery
      .range(from, to)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 