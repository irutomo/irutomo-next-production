

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_clerk_user_id"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  claims json;
  clerk_id text;
BEGIN
  -- JWTクレームを取得
  claims := current_setting('request.jwt.claims', true)::json;
  
  -- まずuser_metadataからclerk_idを取得
  clerk_id := claims->'user_metadata'->>'clerk_id';
  
  -- 見つからない場合は他の場所も確認
  IF clerk_id IS NULL THEN
    clerk_id := claims->>'sub';
  END IF;
  
  RETURN clerk_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."get_clerk_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_id_from_clerk_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  clerk_id text;
  user_id uuid;
BEGIN
  clerk_id := get_clerk_user_id();
  
  IF clerk_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- clerk_idからuserテーブルのuser_idを取得
  SELECT id INTO user_id
  FROM public.users
  WHERE clerk_id = clerk_id;
  
  RETURN user_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."get_user_id_from_clerk_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."requesting_user_id"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::text;
$$;


ALTER FUNCTION "public"."requesting_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE FOREIGN DATA WRAPPER "clerk" HANDLER "extensions"."wasm_fdw_handler" VALIDATOR "extensions"."wasm_fdw_validator";




CREATE SERVER "clerk_server" FOREIGN DATA WRAPPER "clerk" OPTIONS (
    "api_key_id" '6f2f7c47-54ea-470c-a46b-3f8bfd3264d2',
    "api_url" 'https://api.clerk.com/v1',
    "fdw_package_checksum" '613be26b59fa4c074e0b93f0db617fcd7b468d4d02edece0b1f85fdb683ebdc4',
    "fdw_package_name" 'supabase:clerk-fdw',
    "fdw_package_url" 'https://github.com/supabase/wrappers/releases/download/wasm_clerk_fdw_v0.1.0/clerk_fdw.wasm',
    "fdw_package_version" '0.1.0'
);


ALTER SERVER "clerk_server" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_users" IS '管理者として指定されたユーザーの一覧';



COMMENT ON COLUMN "public"."admin_users"."id" IS '管理者レコードの一意識別子';



COMMENT ON COLUMN "public"."admin_users"."user_id" IS 'ユーザーID（usersテーブルへの参照）';



CREATE FOREIGN TABLE "public"."clerk_users" (
    "id" "text",
    "invitation_id" "text",
    "identifier" "text",
    "identifier_type" "text",
    "instance_id" "text",
    "created_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "attrs" "jsonb"
)
SERVER "clerk_server"
OPTIONS (
    "object" 'allowlist_identifiers',
    "schema" 'public'
);


ALTER FOREIGN TABLE "public"."clerk_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "notification_id" "uuid",
    "sent_at" timestamp with time zone,
    "status" "text",
    "email_to" "text" NOT NULL,
    "email_from" "text",
    "subject" "text",
    "content" "text",
    "template_id" "uuid",
    "error" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_logs" IS 'メール送信ログ';



CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_templates" IS 'メールテンプレート';



CREATE TABLE IF NOT EXISTS "public"."menu_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2),
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."menu_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."menu_items" IS 'レストランのメニュー項目';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "read" boolean DEFAULT false,
    "data" "jsonb",
    "sent_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."notifications" IS 'ユーザー通知';



CREATE TABLE IF NOT EXISTS "public"."payment_error_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transaction_id" "uuid",
    "error_code" "text" NOT NULL,
    "error_message" "text" NOT NULL,
    "retry_count" integer DEFAULT 0,
    "last_retry_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reservation_id" "uuid",
    "user_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'JPY'::"text" NOT NULL,
    "status" "text" NOT NULL,
    "payment_provider" "text" NOT NULL,
    "provider_transaction_id" "text",
    "provider_order_id" "text",
    "error_code" "text",
    "error_message" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."paypal_transaction_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transaction_id" "uuid",
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "amount" numeric(10,2),
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."paypal_transaction_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."paypal_transaction_logs" IS 'PayPalトランザクションの変更履歴を記録するテーブル';



CREATE TABLE IF NOT EXISTS "public"."paypal_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "reservation_id" "uuid",
    "transaction_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'JPY'::"text" NOT NULL,
    "paypal_order_id" "text",
    "paypal_payment_id" "text",
    "paypal_token" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "error_code" "text",
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "last_retry_at" timestamp with time zone,
    "webhook_received" boolean DEFAULT false,
    "webhook_processed" boolean DEFAULT false
);


ALTER TABLE "public"."paypal_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."paypal_transactions" IS 'PayPalトランザクション情報を管理するテーブル';



COMMENT ON COLUMN "public"."paypal_transactions"."transaction_type" IS 'トランザクションの種類（支払い、返金など）';



COMMENT ON COLUMN "public"."paypal_transactions"."status" IS 'トランザクションの状態';



COMMENT ON COLUMN "public"."paypal_transactions"."amount" IS '取引金額';



COMMENT ON COLUMN "public"."paypal_transactions"."currency" IS '通貨単位';



COMMENT ON COLUMN "public"."paypal_transactions"."paypal_order_id" IS 'PayPal注文ID';



COMMENT ON COLUMN "public"."paypal_transactions"."paypal_payment_id" IS 'PayPal支払いID';



COMMENT ON COLUMN "public"."paypal_transactions"."paypal_token" IS 'PayPalトークン';



CREATE TABLE IF NOT EXISTS "public"."price_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "restaurant_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'JPY'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."price_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."price_plans" IS 'レストランの価格プラン';



CREATE TABLE IF NOT EXISTS "public"."reservations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "clerk_id" "text",
    "reservation_date" "date" NOT NULL,
    "reservation_time" "text" NOT NULL,
    "number_of_people" integer NOT NULL,
    "guest_name" "text",
    "guest_email" "text",
    "guest_phone" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_status" "text" DEFAULT 'unpaid'::"text",
    "payment_method" "text",
    "payment_provider" "text",
    "payment_amount" numeric(10,2),
    "paypal_order_id" "text",
    "paypal_transaction_id" "text",
    "payment_info" "jsonb",
    "metadata" "jsonb",
    "original_id" "uuid",
    "external_id" "uuid",
    "cancel_reason" "text",
    "notes" "text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reservations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'completed'::"text", 'cancelled'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."reservations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurant_tables" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "capacity" integer NOT NULL,
    "status" "text" DEFAULT 'available'::"text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurant_tables" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_tables" IS 'レストランのテーブル';



CREATE TABLE IF NOT EXISTS "public"."restaurants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "korean_address" "text",
    "english_address" "text",
    "phone_number" "text",
    "email" "text",
    "description" "text",
    "korean_description" "text",
    "japanese_name" "text",
    "korean_name" "text",
    "cuisine" "text",
    "location" "text",
    "rating" numeric(3,1),
    "price_range" "text",
    "opening_hours" "text",
    "image_url" "text",
    "image" "text",
    "images" "jsonb",
    "google_maps_link" "text",
    "has_vegetarian_options" boolean DEFAULT false,
    "has_english_menu" boolean DEFAULT false,
    "has_korean_menu" boolean DEFAULT false,
    "has_japanese_menu" boolean DEFAULT true,
    "phone_reservation_required" boolean DEFAULT false,
    "owner_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clerk_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "phone" "text",
    "language_preference" "text" DEFAULT 'ja'::"text",
    "timezone" "text" DEFAULT 'Asia/Tokyo'::"text",
    "role" "text" DEFAULT 'user'::"text",
    "payment_methods" "jsonb",
    "default_payment_method_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'アプリケーションユーザー - Clerk認証と連携（auth.usersの代わりとなるテーブル）';



COMMENT ON COLUMN "public"."users"."id" IS 'システム内部のユーザーID - Clerkユーザーと連携';



COMMENT ON COLUMN "public"."users"."clerk_id" IS 'Clerk認証サービスのユーザーID - 認証の主キー';



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_error_logs"
    ADD CONSTRAINT "payment_error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."paypal_transaction_logs"
    ADD CONSTRAINT "paypal_transaction_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."paypal_transactions"
    ADD CONSTRAINT "paypal_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_clerk_id_key" UNIQUE ("clerk_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "email_logs_notification_id_idx" ON "public"."email_logs" USING "btree" ("notification_id");



CREATE INDEX "email_logs_user_id_idx" ON "public"."email_logs" USING "btree" ("user_id");



CREATE INDEX "email_templates_name_idx" ON "public"."email_templates" USING "btree" ("name");



CREATE INDEX "idx_menu_items_restaurant_id" ON "public"."menu_items" USING "btree" ("restaurant_id");



CREATE INDEX "idx_payment_error_logs_transaction_id" ON "public"."payment_error_logs" USING "btree" ("transaction_id");



CREATE INDEX "idx_payment_transactions_reservation_id" ON "public"."payment_transactions" USING "btree" ("reservation_id");



CREATE INDEX "idx_payment_transactions_status" ON "public"."payment_transactions" USING "btree" ("status");



CREATE INDEX "idx_payment_transactions_user_id" ON "public"."payment_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_price_plans_restaurant_id" ON "public"."price_plans" USING "btree" ("restaurant_id");



CREATE INDEX "idx_reservations_clerk_id" ON "public"."reservations" USING "btree" ("clerk_id");



CREATE INDEX "idx_reservations_date" ON "public"."reservations" USING "btree" ("reservation_date");



CREATE INDEX "idx_reservations_restaurant_id" ON "public"."reservations" USING "btree" ("restaurant_id");



CREATE INDEX "idx_reservations_status" ON "public"."reservations" USING "btree" ("status");



CREATE INDEX "idx_reservations_user_id" ON "public"."reservations" USING "btree" ("user_id");



CREATE INDEX "idx_restaurant_tables_restaurant_id" ON "public"."restaurant_tables" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurants_cuisine" ON "public"."restaurants" USING "btree" ("cuisine");



CREATE INDEX "idx_restaurants_location" ON "public"."restaurants" USING "btree" ("location");



CREATE INDEX "idx_restaurants_name" ON "public"."restaurants" USING "btree" ("name");



CREATE INDEX "idx_users_clerk_id" ON "public"."users" USING "btree" ("clerk_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "menu_items_restaurant_id_idx" ON "public"."menu_items" USING "btree" ("restaurant_id");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "price_plans_restaurant_id_idx" ON "public"."price_plans" USING "btree" ("restaurant_id");



CREATE INDEX "restaurant_tables_restaurant_id_idx" ON "public"."restaurant_tables" USING "btree" ("restaurant_id");



CREATE OR REPLACE TRIGGER "update_payment_transactions_updated_at" BEFORE UPDATE ON "public"."payment_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reservations_updated_at" BEFORE UPDATE ON "public"."reservations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_restaurants_updated_at" BEFORE UPDATE ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "fk_email_template" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_error_logs"
    ADD CONSTRAINT "payment_error_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."paypal_transaction_logs"
    ADD CONSTRAINT "paypal_transaction_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."paypal_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."paypal_transactions"
    ADD CONSTRAINT "paypal_transactions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."paypal_transactions"
    ADD CONSTRAINT "paypal_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."price_plans"
    ADD CONSTRAINT "price_plans_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."restaurant_tables"
    ADD CONSTRAINT "restaurant_tables_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "Admin can manage admin_users" ON "public"."admin_users" USING ((("auth"."jwt"() ->> 'email'::"text") IN ( SELECT "u"."email"
   FROM ("public"."users" "u"
     JOIN "public"."admin_users" "au" ON (("u"."id" = "au"."user_id")))))) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") IN ( SELECT "u"."email"
   FROM ("public"."users" "u"
     JOIN "public"."admin_users" "au" ON (("u"."id" = "au"."user_id"))))));



CREATE POLICY "Admin can read email_logs" ON "public"."email_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."admin_users" "au"
     JOIN "public"."users" "u" ON (("au"."user_id" = "u"."id")))
  WHERE ("u"."clerk_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Allow full access during development" ON "public"."paypal_transaction_logs" USING (true);



CREATE POLICY "Allow full access during development" ON "public"."paypal_transactions" USING (true);



CREATE POLICY "Allow public read access to menu_items" ON "public"."menu_items" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to restaurant_tables" ON "public"."restaurant_tables" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to restaurants" ON "public"."restaurants" FOR SELECT USING (true);



CREATE POLICY "Clerkユーザーは自分の予約のみ参照可能" ON "public"."reservations" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = "clerk_id"));



CREATE POLICY "Enable read access for all users" ON "public"."email_templates" FOR SELECT USING (true);



CREATE POLICY "Enable read for users based on restaurant_id" ON "public"."price_plans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."restaurants" "r"
  WHERE ("r"."id" = "price_plans"."restaurant_id"))));



CREATE POLICY "Enable read for users based on user_id" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."menu_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_error_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."paypal_transaction_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."paypal_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurant_tables" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_can_view_own_transaction_logs" ON "public"."paypal_transaction_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."paypal_transactions" "pt"
     JOIN "public"."users" "u" ON (("pt"."user_id" = "u"."id")))
  WHERE (("pt"."id" = "paypal_transaction_logs"."transaction_id") AND ("u"."clerk_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "users_can_view_own_transactions" ON "public"."paypal_transactions" FOR SELECT USING ((("auth"."uid"() IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."clerk_id" = ("auth"."uid"())::"text"))) OR ("user_id" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."clerk_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "ユーザーは自分の予約のみ閲覧可能" ON "public"."reservations" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "ユーザーは自分の情報のみ閲覧可能" ON "public"."users" FOR SELECT USING (("clerk_id" = ("auth"."uid"())::"text"));



CREATE POLICY "ユーザーは自分の決済情報のみ閲覧可能" ON "public"."payment_transactions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "管理者は全ての予約を参照可能" ON "public"."reservations" FOR SELECT USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "管理者は全予約を閲覧可能" ON "public"."reservations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "管理者は全情報を閲覧可能" ON "public"."users" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "管理者は全決済情報を閲覧可能" ON "public"."payment_transactions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";












































































































































































































































































































GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";





















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."clerk_users" TO "anon";
GRANT ALL ON TABLE "public"."clerk_users" TO "authenticated";
GRANT ALL ON TABLE "public"."clerk_users" TO "service_role";



GRANT ALL ON TABLE "public"."email_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_logs" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."menu_items" TO "anon";
GRANT ALL ON TABLE "public"."menu_items" TO "authenticated";
GRANT ALL ON TABLE "public"."menu_items" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payment_error_logs" TO "anon";
GRANT ALL ON TABLE "public"."payment_error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."paypal_transaction_logs" TO "anon";
GRANT ALL ON TABLE "public"."paypal_transaction_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."paypal_transaction_logs" TO "service_role";



GRANT ALL ON TABLE "public"."paypal_transactions" TO "anon";
GRANT ALL ON TABLE "public"."paypal_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."paypal_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."price_plans" TO "anon";
GRANT ALL ON TABLE "public"."price_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."price_plans" TO "service_role";



GRANT ALL ON TABLE "public"."reservations" TO "anon";
GRANT ALL ON TABLE "public"."reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."reservations" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_tables" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_tables" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_tables" TO "service_role";



GRANT ALL ON TABLE "public"."restaurants" TO "anon";
GRANT ALL ON TABLE "public"."restaurants" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurants" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
