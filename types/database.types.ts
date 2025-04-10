export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone_number: string | null
          phone: string | null
          category: string | null
          price_range: string | null
          opening_hours: string | null
          images: Json | null
          image_url: string | null
          image: string | null
          rating: number | null
          cuisine: string | null
          korean_cuisine: string | null
          location: string | null
          created_at: string | null
          updated_at: string | null
          japanese_name: string | null
          korean_name: string | null
          english_address: string | null
          korean_address: string | null
          korean_description: string | null
          google_maps_link: string | null
          has_vegetarian_options: boolean | null
          has_english_menu: boolean | null
          has_korean_menu: boolean | null
          has_japanese_menu: boolean | null
          phone_reservation_required: boolean | null
          owner_id: string | null
          is_active: boolean | null
          email: string | null
        }
        Insert: {
          id?: string
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
        Update: {
          id?: string
          name?: string
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
      }
      reservations: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          date: string
          time: string
          party_size: number
          status: string
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          date: string
          time: string
          party_size: number
          status: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          date?: string
          time?: string
          party_size?: number
          status?: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          profile_image: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          profile_image?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          profile_image?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 