# 技術コンテキスト - irutomo222レストラン予約システム

## 使用技術一覧

### フロントエンド
- **フレームワーク**: Next.js 15.2（App Router）
- **言語**: TypeScript 5.2+
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 3.4+
- **UIコンポーネント**: Shadcn UI
- **アイコン**: Lucide Icons
- **フォーム**: React Hook Form
- **バリデーション**: Zod
- **日付処理**: date-fns
- **国際化**: next-intl
- **アニメーション**: Framer Motion

### バックエンド
- **サーバーサイド実装**: Next.js Server Components, Server Actions
- **API**: Next.js Route Handlers
- **データベース**: Supabase (PostgreSQL)
- **認証**: Clerk (Supabaseと連携)
- **決済処理**: PayPal API (Server Actions)
- **画像処理**: next/image, Cloudinary
- **エラーハンドリング**: Next.js エラーバウンダリ
- **セキュリティ**: Helmet, CSP設定

### 開発ツール
- **パッケージ管理**: npm
- **ビルドツール**: Turbopack (開発環境), webpack (本番環境)
- **リンター/フォーマッター**: ESLint, Prettier
- **バージョン管理**: Git, GitHub
- **CI/CD**: GitHub Actions, Vercel Deployments

### テスト
- **ユニットテスト**: Vitest
- **コンポーネントテスト**: Vitest, Testing Library
- **E2Eテスト**: Playwright
- **APIテスト**: Insomnia

### デプロイ
- **ホスティング**: Vercel
- **エッジネットワーク**: Vercel Edge Network
- **監視**: Vercel Analytics
- **ログ**: Vercel Logs

## 主要な技術実装

### Next.js 15.2 App Router

```typescript
// app/restaurants/[id]/page.tsx
export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await getRestaurantById(params.id);
  
  return (
    <Suspense fallback={<RestaurantSkeleton />}>
      <RestaurantDetails restaurant={restaurant} />
      <Suspense fallback={<ReservationFormSkeleton />}>
        <ReservationForm restaurantId={params.id} />
      </Suspense>
    </Suspense>
  );
}

// ストリーミングメタデータの実装例
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const restaurant = await getRestaurantById(params.id);
  
  return {
    title: `${restaurant.name} - irutomo222予約`,
    description: restaurant.description,
    openGraph: {
      images: [{ url: restaurant.imageUrl }],
    },
  };
}
```

### Clerk-Supabase認証連携

認証方式をJWTからセッショントークン方式に移行し、より安全で効率的な認証フローを実現しています。

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/restaurants",
    "/restaurants/(.*)",
    "/api/webhook/(.*)",
    "/service",
    "/reviews",
  ],
  ignoredRoutes: [
    "/api/webhook/(.*)"
  ]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

// SupabaseとClerkの連携例
// utils/supabase.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { currentUser } from '@clerk/nextjs/server';

export async function createAuthenticatedSupabaseClient() {
  const user = await currentUser();
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Clerkユーザー情報をSupabaseセッションにセット
  if (user) {
    const { data } = await supabase.auth.setSession({
      access_token: user.id,
      refresh_token: '',
    });
  }
  
  return supabase;
}
```

### Server Actions

フォーム処理や決済処理など、セキュリティが重要な処理をServer Actionsで実装しています。

```typescript
// app/reservations/actions.ts
'use server'

import { createAuthenticatedSupabaseClient } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const reservationSchema = z.object({
  restaurantId: z.string(),
  date: z.string(),
  time: z.string(),
  partySize: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
});

export async function createReservation(formData: FormData) {
  const supabase = await createAuthenticatedSupabaseClient();
  
  try {
    const validated = reservationSchema.parse({
      restaurantId: formData.get('restaurantId'),
      date: formData.get('date'),
      time: formData.get('time'),
      partySize: Number(formData.get('partySize')),
      specialRequests: formData.get('specialRequests') || '',
    });
    
    const { data, error } = await supabase
      .from('reservations')
      .insert([validated])
      .select()
      .single();
      
    if (error) throw error;
    
    revalidatePath('/reservations');
    redirect(`/reservations/${data.id}/confirmation`);
  } catch (error) {
    console.error('Reservation creation failed:', error);
    return { error: '予約の作成に失敗しました。もう一度お試しください。' };
  }
}
```

### PayPal統合

PayPalの支払い処理をServer Actionsを使って安全に実装しています。

```typescript
// app/payment/actions.ts
'use server'

import { z } from 'zod';
import { createAuthenticatedSupabaseClient } from '@/utils/supabase';
import { PayPalSDK } from '@/lib/paypal/sdk';
import { headers } from 'next/headers';

const paymentSchema = z.object({
  reservationId: z.string(),
  paymentId: z.string(),
  amount: z.number().positive(),
});

export async function processPayment(formData: FormData) {
  const supabase = await createAuthenticatedSupabaseClient();
  
  try {
    const validated = paymentSchema.parse({
      reservationId: formData.get('reservationId'),
      paymentId: formData.get('paymentId'),
      amount: parseFloat(formData.get('amount') as string),
    });
    
    // PayPal APIを使用して支払いを処理
    const paypalSdk = new PayPalSDK(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);
    const paymentResult = await paypalSdk.capturePayment(validated.paymentId);
    
    if (paymentResult.status === 'COMPLETED') {
      // 支払い情報をデータベースに保存
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          reservation_id: validated.reservationId,
          payment_id: validated.paymentId,
          amount: validated.amount,
          status: 'completed',
          payment_method: 'paypal',
          transaction_data: paymentResult,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // 予約ステータスを更新
      await supabase
        .from('reservations')
        .update({ payment_status: 'paid' })
        .eq('id', validated.reservationId);
      
      return { success: true, paymentId: validated.paymentId };
    } else {
      throw new Error('Payment not completed');
    }
  } catch (error) {
    console.error('Payment processing failed:', error);
    return { error: '支払い処理に失敗しました。もう一度お試しください。' };
  }
}
```

### ストリーミングUIとSuspense

段階的なコンテンツ表示とユーザー体験向上のために、ストリーミングUIとSuspenseを積極的に活用しています。

```tsx
// app/page.tsx
import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import PopularCuisines from '@/components/home/PopularCuisines';
import RecentReviews from '@/components/home/RecentReviews';
import { FeaturedRestaurantsSkeleton, PopularCuisinesSkeleton, RecentReviewsSkeleton } from '@/components/skeletons';

export default function HomePage() {
  return (
    <main>
      <Hero />
      
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">注目のレストラン</h2>
        <Suspense fallback={<FeaturedRestaurantsSkeleton />}>
          <FeaturedRestaurants />
        </Suspense>
      </section>
      
      <section className="py-12 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">人気のジャンル</h2>
        <Suspense fallback={<PopularCuisinesSkeleton />}>
          <PopularCuisines />
        </Suspense>
      </section>
      
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">最新のレビュー</h2>
        <Suspense fallback={<RecentReviewsSkeleton />}>
          <RecentReviews />
        </Suspense>
      </section>
    </main>
  );
}
```

### レスポンシブデザイン

モバイルからデスクトップまで、様々なデバイスに対応したレスポンシブデザインを実装しています。

```tsx
// components/layout/Header.tsx
import { useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">irutomo222</Link>
        
        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/restaurants" className="hover:text-primary transition-colors">レストラン</Link>
          <Link href="/reservations" className="hover:text-primary transition-colors">予約確認</Link>
          <Link href="/reviews" className="hover:text-primary transition-colors">レビュー</Link>
          <Link href="/service" className="hover:text-primary transition-colors">サービス紹介</Link>
          <UserButton afterSignOutUrl="/" />
        </nav>
        
        {/* モバイルメニューボタン */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* モバイルナビゲーション */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-4">
            <Link href="/restaurants" className="hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
              レストラン
            </Link>
            <Link href="/reservations" className="hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
              予約確認
            </Link>
            <Link href="/reviews" className="hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
              レビュー
            </Link>
            <Link href="/service" className="hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
              サービス紹介
            </Link>
            <div className="py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
```

## テスト・運用環境

### テスト環境
- Vitestによるユニットテストとコンポーネントテスト
- Playwrightによるエンドツーエンドテスト
- PayPalサンドボックス環境でのテスト

### 運用環境
- Vercel Production環境（メイン環境）
- Vercel Preview環境（PR確認用）
- Vercel Analytics（パフォーマンスモニタリング）

## 重要な技術的実装

### Clerk-Supabase認証統合
- セッショントークン方式の採用（旧JWT方式からの移行）
- App RouterミドルウェアでのRouteごとのアクセス制御
- Supabase RLSポリシーとClerkユーザーIDの連携

### PayPal決済処理
- 公式React SDKの使用（クライアントサイド）
- Server Actionsでの安全な決済処理（サーバーサイド）
- トランザクション処理と整合性確保のロジック

### Next.js 15.2最適化
- ストリーミングメタデータによるページロード高速化
- コンポーネントの適切な分割（Server/Client）
- 永続的キャッシュの活用によるデータフェッチの最適化
- Turbopackの試験的導入

### セキュリティ実装
- CSPヘッダーの最適化（特にClerkとPayPal対応）
- Server Actionsを活用した安全なデータ処理
- エラーオブジェクトのサニタイズ

### 環境変数管理
- 本番環境とローカル環境での.env設定
- Vercelでの環境変数管理
- 認証情報とAPIキーの安全な管理

### エラーハンドリング
- グローバルエラーバウンダリの実装
- 構造化されたエラーレスポンス
- ユーザーフレンドリーなエラーメッセージ表示
- デバッグモードの切り替え機能

## 技術的な課題と解決策

### 課題1: クライアント/サーバーコンポーネントの適切な分離
- **解決策**: コンポーネント設計時にデータ取得と表示を明確に分離し、サーバーコンポーネントでデータを取得して、クライアントコンポーネントにpropsとして渡す設計パターンを採用。

### 課題2: 認証トークンの更新とセッション管理
- **解決策**: セッショントークン方式の採用と、バックグラウンドでのトークンリフレッシュメカニズムの実装によりシームレスな認証体験を提供。

### 課題3: モバイル対応とレスポンシブデザイン
- **解決策**: モバイルファーストアプローチと、Tailwind CSSのブレークポイントを活用した段階的なレイアウト変更。ハンバーガーメニューとサイドバーの実装で使いやすさを向上。

### 課題4: パフォーマンス最適化
- **解決策**: Next.jsのコンポーネント最適化、画像最適化、フォント最適化の活用。Lighthouse、Web Vitalsに基づく継続的な改善。

### 課題5: PayPalサンドボックス環境でのセッション問題
- **解決策**: 決済フロー内でセッション状態を明示的に管理し、エラーハンドリングと再試行メカニズムを強化。

## 参考リソースとドキュメント

- [Next.js 15.2ドキュメント](https://nextjs.org/docs)
- [React 19ドキュメント](https://react.dev/)
- [Clerk認証ドキュメント](https://clerk.dev/docs)
- [Supabase公式ガイド](https://supabase.io/docs)
- [PayPal開発者ドキュメント](https://developer.paypal.com/docs)
- [Vercelデプロイメントドキュメント](https://vercel.com/docs)
- [社内設計ドキュメント](https://docs.example.com/design)（社内リンク） 