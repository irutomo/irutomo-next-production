// ===================================
// Supabase Database Types
// ===================================

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
      japan_info: {
        Row: {
          id: string
          title: string
          korean_title: string | null
          description: string
          korean_description: string | null
          content: string
          korean_content: string | null
          image_url: string | null
          tags: string[] | null
          location: string | null
          is_popular: boolean | null
          published_at: string | null
          created_at: string
          updated_at: string
          author: string | null
          views: number | null
        }
        Insert: {
          id?: string
          title: string
          korean_title?: string | null
          description: string
          korean_description?: string | null
          content: string
          korean_content?: string | null
          image_url?: string | null
          tags?: string[] | null
          location?: string | null
          is_popular?: boolean | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author?: string | null
          views?: number | null
        }
        Update: {
          id?: string
          title?: string
          korean_title?: string | null
          description?: string
          korean_description?: string | null
          content?: string
          korean_content?: string | null
          image_url?: string | null
          tags?: string[] | null
          location?: string | null
          is_popular?: boolean | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author?: string | null
          views?: number | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          phone: string | null
          website: string | null
          image_url: string | null
          cuisine_type: string | null
          price_range: string | null
          opening_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          phone?: string | null
          website?: string | null
          image_url?: string | null
          cuisine_type?: string | null
          price_range?: string | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          phone?: string | null
          website?: string | null
          image_url?: string | null
          cuisine_type?: string | null
          price_range?: string | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 