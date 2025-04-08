import { createServerSupabaseClient } from '@/app/lib/supabase'
import { notFound } from 'next/navigation'
import SearchResults from './components/search-results'

export const revalidate = 0 // キャッシュさせない

export default async function SearchPage(props: any) {
  const searchQuery = props.searchParams.q || '';
  const location = typeof props.searchParams.location === 'string' ? props.searchParams.location : ''
  const category = typeof props.searchParams.category === 'string' ? props.searchParams.category : ''
  const minPrice = typeof props.searchParams.minPrice === 'string' ? props.searchParams.minPrice : '0'
  const maxPrice = typeof props.searchParams.maxPrice === 'string' ? props.searchParams.maxPrice : '100000'
  const page = typeof props.searchParams.page === 'string' ? parseInt(props.searchParams.page) : 1
  const pageSize = typeof props.searchParams.pageSize === 'string' ? parseInt(props.searchParams.pageSize) : 10

  const supabase = await createServerSupabaseClient()
  
  let supabaseQuery = supabase
    .from('restaurants')
    .select('*, restaurant_categories(*)', { count: 'exact' })
  
  // テキスト検索フィルター
  if (searchQuery) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
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
  
  // ページネーション
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  const { data: restaurants, error, count } = await supabaseQuery
    .range(from, to)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Search error:', error.message)
    return notFound()
  }

  // カテゴリー一覧の取得
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">検索結果</h1>
      <SearchResults 
        restaurants={restaurants || []}
        categories={categories || []}
        totalCount={count || 0}
        currentPage={page}
        pageSize={pageSize}
        query={searchQuery}
        location={location}
        category={category}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </div>
  )
} 