export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clerk_users: {
        Row: {
          attrs: Json | null
          created_at: string | null
          id: string | null
          identifier: string | null
          identifier_type: string | null
          instance_id: string | null
          invitation_id: string | null
          updated_at: string | null
        }
        Insert: {
          attrs?: Json | null
          created_at?: string | null
          id?: string | null
          identifier?: string | null
          identifier_type?: string | null
          instance_id?: string | null
          invitation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attrs?: Json | null
          created_at?: string | null
          id?: string | null
          identifier?: string | null
          identifier_type?: string | null
          instance_id?: string | null
          invitation_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          content: string | null
          created_at: string | null
          email_from: string | null
          email_to: string
          error: string | null
          id: string
          metadata: Json | null
          notification_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          email_from?: string | null
          email_to: string
          error?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          email_from?: string | null
          email_to?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_email_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          read: boolean | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_error_logs: {
        Row: {
          created_at: string | null
          error_code: string
          error_message: string
          id: string
          last_retry_at: string | null
          retry_count: number | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code: string
          error_message: string
          id?: string
          last_retry_at?: string | null
          retry_count?: number | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string
          error_message?: string
          id?: string
          last_retry_at?: string | null
          retry_count?: number | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_error_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          error_code: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          payment_provider: string
          provider_order_id: string | null
          provider_transaction_id: string | null
          reservation_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_provider: string
          provider_order_id?: string | null
          provider_transaction_id?: string | null
          reservation_id?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_provider?: string
          provider_order_id?: string | null
          provider_transaction_id?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_transaction_logs: {
        Row: {
          amount: number | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paypal_transaction_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "paypal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_transactions: {
        Row: {
          amount: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          currency: string
          error_code: string | null
          error_message: string | null
          id: string
          last_retry_at: string | null
          paypal_order_id: string | null
          paypal_payment_id: string | null
          paypal_token: string | null
          reservation_id: string | null
          retry_count: number | null
          status: string
          transaction_type: string
          updated_at: string | null
          user_id: string | null
          webhook_processed: boolean | null
          webhook_received: boolean | null
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          paypal_token?: string | null
          reservation_id?: string | null
          retry_count?: number | null
          status: string
          transaction_type: string
          updated_at?: string | null
          user_id?: string | null
          webhook_processed?: boolean | null
          webhook_received?: boolean | null
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          paypal_token?: string | null
          reservation_id?: string | null
          retry_count?: number | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string | null
          webhook_processed?: boolean | null
          webhook_received?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "paypal_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_plans: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          name: string
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          name: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          name?: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_plans_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancel_reason: string | null
          clerk_id: string | null
          created_at: string | null
          external_id: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          metadata: Json | null
          notes: string | null
          number_of_people: number
          original_id: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_info: Json | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          paypal_order_id: string | null
          paypal_transaction_id: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_reason?: string | null
          clerk_id?: string | null
          created_at?: string | null
          external_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          number_of_people: number
          original_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_info?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_reason?: string | null
          clerk_id?: string | null
          created_at?: string | null
          external_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          number_of_people?: number
          original_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_info?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          location: string | null
          name: string
          restaurant_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          restaurant_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          restaurant_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          email: string | null
          english_address: string | null
          google_maps_link: string | null
          has_english_menu: boolean | null
          has_japanese_menu: boolean | null
          has_korean_menu: boolean | null
          has_vegetarian_options: boolean | null
          id: string
          image: string | null
          image_url: string | null
          images: Json | null
          is_active: boolean | null
          japanese_name: string | null
          korean_address: string | null
          korean_description: string | null
          korean_name: string | null
          location: string | null
          name: string
          opening_hours: string | null
          owner_id: string | null
          phone_number: string | null
          phone_reservation_required: boolean | null
          price_range: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          email?: string | null
          english_address?: string | null
          google_maps_link?: string | null
          has_english_menu?: boolean | null
          has_japanese_menu?: boolean | null
          has_korean_menu?: boolean | null
          has_vegetarian_options?: boolean | null
          id?: string
          image?: string | null
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          japanese_name?: string | null
          korean_address?: string | null
          korean_description?: string | null
          korean_name?: string | null
          location?: string | null
          name: string
          opening_hours?: string | null
          owner_id?: string | null
          phone_number?: string | null
          phone_reservation_required?: boolean | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          email?: string | null
          english_address?: string | null
          google_maps_link?: string | null
          has_english_menu?: boolean | null
          has_japanese_menu?: boolean | null
          has_korean_menu?: boolean | null
          has_vegetarian_options?: boolean | null
          id?: string
          image?: string | null
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          japanese_name?: string | null
          korean_address?: string | null
          korean_description?: string | null
          korean_name?: string | null
          location?: string | null
          name?: string
          opening_hours?: string | null
          owner_id?: string | null
          phone_number?: string | null
          phone_reservation_required?: boolean | null
          price_range?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clerk_id: string
          created_at: string | null
          default_payment_method_id: string | null
          email: string
          id: string
          language_preference: string | null
          metadata: Json | null
          name: string | null
          payment_methods: Json | null
          phone: string | null
          role: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          clerk_id: string
          created_at?: string | null
          default_payment_method_id?: string | null
          email: string
          id?: string
          language_preference?: string | null
          metadata?: Json | null
          name?: string | null
          payment_methods?: Json | null
          phone?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          clerk_id?: string
          created_at?: string | null
          default_payment_method_id?: string | null
          email?: string
          id?: string
          language_preference?: string | null
          metadata?: Json | null
          name?: string | null
          payment_methods?: Json | null
          phone?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_reservation: {
        Args: {
          p_user_id: string
          p_restaurant_id: string
          p_date: string
          p_time: string
          p_party_size: number
          p_special_requests?: string
        }
        Returns: string
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }[]
      }
      get_clerk_id_from_jwt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_clerk_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_id_from_clerk_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      http_get: {
        Args: {
          url: string
          params?: Json
          headers?: Json
          timeout_milliseconds?: number
        }
        Returns: number
      }
      http_post: {
        Args: {
          url: string
          body?: Json
          params?: Json
          headers?: Json
          timeout_milliseconds?: number
        }
        Returns: number
      }
      import_clerk_users_to_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
            }
            Returns: boolean
          }
      requesting_clerk_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      requesting_clerk_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sync_clerk_user: {
        Args: {
          clerk_id: string
          user_email: string
          user_name: string
        }
        Returns: Json
      }
      update_user_profile: {
        Args: {
          p_clerk_id: string
          p_email: string
          p_name: string
        }
        Returns: boolean
      }
      verify_clerk_user: {
        Args: {
          clerk_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
