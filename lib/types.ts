// SupabaseのデータベーススキーマのTypeScript型定義

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// レストラン情報の型
export type Restaurant = {
  id: string
  name: string
  description?: string | null
  address?: string | null
  phone_number?: string | null
  phone?: string | null
  category?: string | null
  price_range?: string | null
  opening_hours?: string | null
  images?: Json | null
  image_url?: string | null
  image?: string | null
  rating?: number | null
  cuisine?: string | null
  korean_cuisine?: string | null
  location?: string | null
  created_at?: string | null
  updated_at?: string | null
  japanese_name?: string | null
  korean_name?: string | null
  english_address?: string | null
  korean_address?: string | null
  korean_description?: string | null
  google_maps_link?: string | null
  has_vegetarian_options?: boolean | null
  has_english_menu?: boolean | null
  has_korean_menu?: boolean | null
  has_japanese_menu?: boolean | null
  phone_reservation_required?: boolean | null
  owner_id?: string | null
  is_active?: boolean | null
  email?: string | null
}

// 予約情報の型
export type Reservation = {
  id: string
  restaurant_id: string
  user_id: string
  date: string
  time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled'
  special_requests?: string
  created_at: string
  updated_at: string
}

// ユーザー情報の型
export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  profile_image?: string
  phone?: string
  created_at: string
  updated_at: string
}

// レビュー情報の型
export type Review = {
  id: string
  restaurant_id: string
  user_id: string
  rating: number
  comment: string
  visit_date: string
  tags: string[]
  images?: string[]
  created_at: string
  updated_at: string
}

// レビュータグの型
export type ReviewTag = {
  id: string
  name: string
  category: string
}

// レビューに対するリアクションの型
export type ReviewReaction = {
  id: string
  review_id: string
  user_id: string
  reaction_type: 'like' | 'helpful'
  created_at: string
}

// データベース全体のテーブル型
export type Database = {
  restaurants: Restaurant[]
  reservations: Reservation[]
  users: User[]
  reviews: Review[]
  review_tags: ReviewTag[]
  review_reactions: ReviewReaction[]
} 