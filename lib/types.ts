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
  description: string
  address: string
  phone_number?: string
  phone?: string
  category?: string
  price_range?: string
  opening_hours?: string
  images?: string[]
  image_url?: string
  image?: string
  rating?: number
  cuisine?: string
  location?: string
  created_at: string
  updated_at?: string
  japanese_name?: string
  korean_name?: string
  english_address?: string
  korean_address?: string
  korean_description?: string
  google_maps_link?: string
  has_vegetarian_options?: boolean
  has_english_menu?: boolean
  has_korean_menu?: boolean
  has_japanese_menu?: boolean
  phone_reservation_required?: boolean
  owner_id?: string
  is_active?: boolean
  email?: string
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