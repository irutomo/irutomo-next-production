

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_reservation"("p_user_id" "uuid", "p_restaurant_id" "uuid", "p_date" "date", "p_time" time without time zone, "p_party_size" integer, "p_special_requests" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_reservation_id UUID;
    v_current_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- 現在のユーザーIDを取得
    SELECT id INTO v_current_user_id
    FROM public.users
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::TEXT;
    
    -- 管理者かどうかを確認
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE clerk_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::TEXT
        AND role = 'admin'
    ) INTO v_is_admin;
    
    -- 権限チェック：自分の予約または管理者のみ
    IF v_current_user_id = p_user_id OR v_is_admin THEN
        -- 予約を作成
        INSERT INTO public.reservations(
            user_id,
            restaurant_id,
            date,
            time,
            party_size,
            special_requests,
            status
        ) VALUES (
            p_user_id,
            p_restaurant_id,
            p_date,
            p_time,
            p_party_size,
            p_special_requests,
            'pending'  -- デフォルトステータス
        ) RETURNING id INTO v_reservation_id;
        
        RETURN v_reservation_id;
    ELSE
        RAISE EXCEPTION '権限がありません：自分のIDまたは管理者のみが予約を作成できます';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '予約の作成に失敗しました: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_reservation"("p_user_id" "uuid", "p_restaurant_id" "uuid", "p_date" "date", "p_time" time without time zone, "p_party_size" integer, "p_special_requests" "text") OWNER TO "postgres";

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



CREATE OR REPLACE FUNCTION "public"."get_admin_users"() RETURNS SETOF "public"."admin_users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN QUERY SELECT * FROM public.admin_users;
  ELSE
    RETURN;
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_admin_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_clerk_id_from_jwt"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::jsonb->>'sub')::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."get_clerk_id_from_jwt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_clerk_user_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_clerk_id text;
  v_user_id uuid;
BEGIN
  -- まずClerk IDを取得
  v_clerk_id := get_clerk_user_id();
  
  IF v_clerk_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- clerk_idからuserテーブルのuser_idを取得
  SELECT id INTO v_user_id
  FROM public.users
  WHERE clerk_id = v_clerk_id;
  
  -- ユーザーが見つからない場合、新規作成を試みる
  IF v_user_id IS NULL THEN
    -- JWTからユーザー情報を取得
    DECLARE
      v_email text;
      v_name text;
      v_claims json;
    BEGIN
      v_claims := current_setting('request.jwt.claims', true)::json;
      v_email := v_claims->>'email';
      v_name := v_claims->>'name';
      
      -- 最低限の情報があれば仮ユーザーを作成
      IF v_clerk_id IS NOT NULL AND (v_email IS NOT NULL OR v_name IS NOT NULL) THEN
        INSERT INTO public.users (clerk_id, email, name)
        VALUES (v_clerk_id, COALESCE(v_email, v_clerk_id || '@example.com'), COALESCE(v_name, 'User ' || v_clerk_id))
        RETURNING id INTO v_user_id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- エラー時は何もしない
        NULL;
    END;
  END IF;
  
  RETURN v_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."get_user_id_from_clerk_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."http_get"("url" "text", "params" "jsonb" DEFAULT NULL::"jsonb", "headers" "jsonb" DEFAULT NULL::"jsonb", "timeout_milliseconds" integer DEFAULT 30000) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN extensions.http_get(url, params, headers, timeout_milliseconds);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'HTTP GET リクエストエラー: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."http_post"("url" "text", "body" "jsonb" DEFAULT NULL::"jsonb", "params" "jsonb" DEFAULT NULL::"jsonb", "headers" "jsonb" DEFAULT NULL::"jsonb", "timeout_milliseconds" integer DEFAULT 30000) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN extensions.http_post(url, body, params, headers, timeout_milliseconds);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'HTTP POST リクエストエラー: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."import_clerk_users_to_users"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_imported_count integer := 0;
  v_skipped_count integer := 0;
  v_clerk_user record;
  v_result jsonb;
BEGIN
  -- clerk_usersの各レコードをループ
  FOR v_clerk_user IN 
    SELECT id, attrs->>'email_addresses' as email, attrs->>'first_name' as first_name, attrs->>'last_name' as last_name
    FROM public.clerk_users
  LOOP
    -- すでに存在しないか確認
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE clerk_id = v_clerk_user.id) THEN
      -- usersテーブルに挿入
      INSERT INTO public.users (clerk_id, email, name)
      VALUES (
        v_clerk_user.id,
        v_clerk_user.email,
        COALESCE(v_clerk_user.first_name || ' ' || v_clerk_user.last_name, 'User ' || v_clerk_user.id)
      );
      v_imported_count := v_imported_count + 1;
    ELSE
      v_skipped_count := v_skipped_count + 1;
    END IF;
  END LOOP;
  
  v_result := jsonb_build_object(
    'imported', v_imported_count,
    'skipped', v_skipped_count,
    'total', v_imported_count + v_skipped_count
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;


ALTER FUNCTION "public"."import_clerk_users_to_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN admin_users au ON u.id = au.user_id
    WHERE u.clerk_id = requesting_user_id()
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users au -- admin_users テーブルは public スキーマにあると仮定
    WHERE au.user_id = is_admin.user_id -- 関数内の引数名 user_id を参照
  );
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_paypal_transaction_to_clerk"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_clerk_id TEXT;
    v_user_id UUID;
BEGIN
    -- 支払いトランザクションが新規作成された場合
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- 現在のリクエストからClerk IDを抽出
        v_clerk_id := requesting_clerk_id();
        
        -- Clerk IDからユーザーIDを取得
        IF v_clerk_id IS NOT NULL THEN
            SELECT id INTO v_user_id FROM public.users WHERE clerk_id = v_clerk_id;
            
            -- ユーザーIDが見つかった場合、支払い取引にセット
            IF v_user_id IS NOT NULL THEN
                NEW.user_id := v_user_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."link_paypal_transaction_to_clerk"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."requesting_clerk_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN coalesce(
    current_setting('request.jwt.claims', true)::jsonb->>'sub',
    current_setting('request.jwt.claims', true)::jsonb->>'clerk_id',
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."requesting_clerk_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."requesting_clerk_user_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- JWTクレームからClerk IDを取得
  RETURN coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."requesting_clerk_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."requesting_user_id"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::text;
$$;


ALTER FUNCTION "public"."requesting_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_clerk_user"("clerk_id" "text", "user_email" "text", "user_name" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_record RECORD;
  result JSONB;
BEGIN
  -- 既存のユーザーを検索
  SELECT * INTO user_record FROM public.users WHERE users.clerk_id = sync_clerk_user.clerk_id;
  
  -- ユーザーが存在しなければ作成、存在すれば更新
  IF user_record.id IS NULL THEN
    INSERT INTO public.users (clerk_id, email, name)
    VALUES (sync_clerk_user.clerk_id, sync_clerk_user.user_email, sync_clerk_user.user_name)
    RETURNING * INTO user_record;
    
    result = jsonb_build_object(
      'action', 'created',
      'user_id', user_record.id,
      'clerk_id', user_record.clerk_id
    );
  ELSE
    UPDATE public.users
    SET 
      email = COALESCE(sync_clerk_user.user_email, users.email),
      name = COALESCE(sync_clerk_user.user_name, users.name),
      updated_at = now()
    WHERE users.clerk_id = sync_clerk_user.clerk_id
    RETURNING * INTO user_record;
    
    result = jsonb_build_object(
      'action', 'updated',
      'user_id', user_record.id,
      'clerk_id', user_record.clerk_id
    );
  END IF;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."sync_clerk_user"("clerk_id" "text", "user_email" "text", "user_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"("p_clerk_id" "text", "p_email" "text", "p_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- INSERTまたはUPDATE（競合時）の実行
  INSERT INTO public.users (clerk_id, email, name, updated_at)
  VALUES (p_clerk_id, p_email, p_name, NOW())
  ON CONFLICT (clerk_id) 
  DO UPDATE SET 
    email = p_email,
    name = p_name,
    updated_at = NOW();
    
  -- 成功を返す
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- エラー情報をログに出力
    RAISE NOTICE 'Error in update_user_profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"("p_clerk_id" "text", "p_email" "text", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_clerk_user"("clerk_user_id" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- 結果をログに出力（開発時のデバッグに便利）
  RAISE NOTICE 'Verifying Clerk user: %', clerk_user_id;
  
  -- 常にtrueを返す単純なバージョン
  -- 実際には、clerk_usersテーブルなどで検証するロジックを実装できます
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."verify_clerk_user"("clerk_user_id" "text") OWNER TO "postgres";


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



CREATE OR REPLACE TRIGGER "trig_link_payment_transaction_to_clerk" BEFORE INSERT OR UPDATE ON "public"."payment_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."link_paypal_transaction_to_clerk"();



CREATE OR REPLACE TRIGGER "trig_link_paypal_transaction_to_clerk" BEFORE INSERT OR UPDATE ON "public"."paypal_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."link_paypal_transaction_to_clerk"();



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



CREATE POLICY "Admin can manage admin_users" ON "public"."admin_users" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can read email_logs" ON "public"."email_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."admin_users" "au"
     JOIN "public"."users" "u" ON (("au"."user_id" = "u"."id")))
  WHERE ("u"."clerk_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Admin users can view all users" ON "public"."users" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow full access during development" ON "public"."paypal_transaction_logs" USING (true);



CREATE POLICY "Allow full access during development" ON "public"."paypal_transactions" USING (true);



CREATE POLICY "Allow public read access to menu_items" ON "public"."menu_items" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to restaurant_tables" ON "public"."restaurant_tables" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to restaurants" ON "public"."restaurants" FOR SELECT USING (true);



CREATE POLICY "Anyone can read restaurants" ON "public"."restaurants" FOR SELECT USING (true);



CREATE POLICY "Anyone can read users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can insert" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Clerkユーザー自身のプロファイル更新可能" ON "public"."users" FOR UPDATE USING (("clerk_id" = "public"."requesting_user_id"()));



CREATE POLICY "Enable read access for all users" ON "public"."email_templates" FOR SELECT USING (true);



CREATE POLICY "Enable read for users based on restaurant_id" ON "public"."price_plans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."restaurants" "r"
  WHERE ("r"."id" = "price_plans"."restaurant_id"))));



CREATE POLICY "Enable read for users based on user_id" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Only service_role can delete user profiles" ON "public"."users" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can update own data" ON "public"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = "clerk_id")) WITH CHECK ((("auth"."uid"())::"text" = "clerk_id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("clerk_id" = "public"."requesting_user_id"()));



CREATE POLICY "Users can update own record" ON "public"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = "clerk_id"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (("clerk_id" = "public"."requesting_user_id"()));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "create_reservations_policy" ON "public"."reservations" FOR INSERT WITH CHECK ((("clerk_id" = "public"."requesting_user_id"()) OR ("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."clerk_id" = "public"."requesting_user_id"()))) OR "public"."is_admin"()));



CREATE POLICY "delete_reservations_policy" ON "public"."reservations" FOR DELETE USING ((("clerk_id" = "public"."requesting_user_id"()) OR ("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."clerk_id" = "public"."requesting_user_id"()))) OR "public"."is_admin"()));



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


CREATE POLICY "update_reservations_policy" ON "public"."reservations" FOR UPDATE USING ((("clerk_id" = "public"."requesting_user_id"()) OR ("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."clerk_id" = "public"."requesting_user_id"()))) OR "public"."is_admin"()));



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



CREATE POLICY "view_reservations_policy" ON "public"."reservations" FOR SELECT USING ((("clerk_id" = "public"."requesting_user_id"()) OR ("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."clerk_id" = "public"."requesting_user_id"()))) OR "public"."is_admin"()));



CREATE POLICY "ユーザーは自分のプロファイルのみ読み取り可" ON "public"."users" FOR SELECT USING ((("clerk_id" = "public"."requesting_clerk_user_id"()) OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "ユーザーは自分のプロファイルのみ閲覧可能" ON "public"."users" FOR SELECT USING (("clerk_id" = "public"."requesting_clerk_user_id"()));



CREATE POLICY "ユーザーは自分の情報のみ閲覧可能" ON "public"."users" FOR SELECT USING (("clerk_id" = ("auth"."uid"())::"text"));



CREATE POLICY "ユーザーは自分の決済情報のみ閲覧可能" ON "public"."payment_transactions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "管理者のみが管理者を追加可能" ON "public"."admin_users" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."clerk_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "管理者のみが管理者一覧を閲覧可能" ON "public"."admin_users" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."clerk_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "管理者のみが管理者情報を削除可能" ON "public"."admin_users" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."clerk_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "管理者のみが管理者情報を更新可能" ON "public"."admin_users" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."clerk_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "管理者は全決済情報を閲覧可能" ON "public"."payment_transactions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";









































































































































































































































































































GRANT ALL ON FUNCTION "public"."create_reservation"("p_user_id" "uuid", "p_restaurant_id" "uuid", "p_date" "date", "p_time" time without time zone, "p_party_size" integer, "p_special_requests" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_reservation"("p_user_id" "uuid", "p_restaurant_id" "uuid", "p_date" "date", "p_time" time without time zone, "p_party_size" integer, "p_special_requests" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_reservation"("p_user_id" "uuid", "p_restaurant_id" "uuid", "p_date" "date", "p_time" time without time zone, "p_party_size" integer, "p_special_requests" "text") TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clerk_id_from_jwt"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_clerk_id_from_jwt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clerk_id_from_jwt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_id_from_clerk_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."import_clerk_users_to_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."import_clerk_users_to_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."import_clerk_users_to_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."link_paypal_transaction_to_clerk"() TO "anon";
GRANT ALL ON FUNCTION "public"."link_paypal_transaction_to_clerk"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_paypal_transaction_to_clerk"() TO "service_role";



GRANT ALL ON FUNCTION "public"."requesting_clerk_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."requesting_clerk_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."requesting_clerk_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."requesting_clerk_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."requesting_clerk_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."requesting_clerk_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "service_role";
GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."sync_clerk_user"("clerk_id" "text", "user_email" "text", "user_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sync_clerk_user"("clerk_id" "text", "user_email" "text", "user_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_clerk_user"("clerk_id" "text", "user_email" "text", "user_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("p_clerk_id" "text", "p_email" "text", "p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_clerk_id" "text", "p_email" "text", "p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_clerk_id" "text", "p_email" "text", "p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_clerk_user"("clerk_user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_clerk_user"("clerk_user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_clerk_user"("clerk_user_id" "text") TO "service_role";





















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
