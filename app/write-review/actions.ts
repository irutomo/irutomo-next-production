'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

interface ReviewFormData {
  restaurantId: string
  restaurantName: string
  visitDate: string
  cuisine: string
  rating: number
  review: string
  tags: string[]
  photos: File[]
}

export async function submitReview(formData: FormData) {
  try {
    // フォームデータの取得と検証
    const restaurantId = formData.get('restaurantId') as string
    const restaurantName = formData.get('restaurant') as string
    const visitDate = formData.get('visitDate') as string
    const cuisine = formData.get('cuisine') as string
    const rating = parseInt(formData.get('rating') as string)
    const review = formData.get('review') as string
    const tags = formData.getAll('tags') as string[]
    const photos = formData.getAll('photos') as File[]

    // 必須フィールドの検証
    if (!restaurantName || !visitDate || !rating || !review) {
      return { success: false, error: '必須項目が入力されていません' }
    }

    // Supabaseクライアントの初期化
    const getSupabaseClient = async () => {
      const cookieStore = await cookies()
      
      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )
    }

    // ユーザー情報の取得
    const supabase = await getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'ログインが必要です' }
    }

    const userId = session.user.id

    // トランザクション的にデータを保存
    let photoUrls: string[] = []

    // 写真のアップロード
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (!photo.size) continue // 空のファイル対策
        
        const fileExt = photo.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`
        
        // storageに画像をアップロード
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review_photos')
          .upload(fileName, photo)
        
        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError)
          continue
        }
        
        // 公開URLを取得
        const { data: publicUrlData } = supabase.storage
          .from('review_photos')
          .getPublicUrl(fileName)
        
        if (publicUrlData) {
          photoUrls.push(publicUrlData.publicUrl)
        }
      }
    }

    // レビューデータの保存
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId || null, // IDがない場合はnull
        restaurant_name: restaurantName,
        visit_date: visitDate,
        cuisine_type: cuisine || null,
        rating,
        content: review,
        tags: tags.length > 0 ? tags : null,
        photos: photoUrls.length > 0 ? photoUrls : null,
        status: 'published'
      })
      .select()

    if (reviewError) {
      console.error('レビュー保存エラー:', reviewError)
      return { success: false, error: 'レビューの保存に失敗しました' }
    }

    // レストランが存在しない場合は新規作成（管理者が後で確認・承認する）
    if (!restaurantId) {
      const { error: newRestaurantError } = await supabase
        .from('restaurant_suggestions')
        .insert({
          name: restaurantName,
          cuisine_type: cuisine || null,
          suggested_by: userId,
          review_id: reviewData?.[0]?.id,
          status: 'pending'
        })

      if (newRestaurantError) {
        console.error('レストラン候補保存エラー:', newRestaurantError)
      }
    }

    // キャッシュの更新
    revalidatePath('/reviews')
    revalidatePath(`/restaurants/${restaurantId}`)

    return { 
      success: true, 
      data: reviewData?.[0]?.id,
      message: 'レビューが投稿されました！' 
    }
  } catch (error) {
    console.error('レビュー投稿エラー:', error)
    return { 
      success: false, 
      error: '予期しないエラーが発生しました。しばらく経ってからお試しください。' 
    }
  }
} 