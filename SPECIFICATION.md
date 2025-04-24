# IRUTOMO プロジェクト仕様書

## 1. プロジェクト概要

**アプリケーション名**: IRUTOMO（イルトモ）  
**概要**: 韓国人旅行者向けの日本食堂予約サービス  
**主要機能**: 現地日本人から人気のある食堂の予約代行、情報提供  
**対応言語**: 韓国語、日本語  
**対象ユーザー**: 日本を訪れる10代から40代までの韓国人観光客  

## 2. 技術スタック

**フロントエンド**:
- Next.js 15.2.0
- React 19.0.0
- TypeScript 5.4.5
- Tailwind CSS 3.4.1

**バックエンド**:
- Supabase (データストレージ)
- Clerk (認証)
- PayPal API (決済)

**デプロイ**:
- Core Server (FTP)

## 3. アプリケーション構造

### 3.1 ディレクトリ構造

```
project/
├── app/                   # Next.js Appディレクトリ
│   ├── api/               # API エンドポイント
│   │   ├── auth/          # 認証関連API
│   │   ├── paypal/        # PayPal決済API
│   │   ├── csp-report/    # CSP違反レポートAPI
│   │   ├── restaurants/   # レストラン関連API
│   │   └── reservations/  # 予約管理API
│   ├── auth/              # 認証関連ページ
│   ├── dashboard/         # ダッシュボード
│   │   ├── reservations/  # 予約管理画面
│   │   └── profile/       # プロフィール管理画面
│   ├── faq/               # FAQページ
│   ├── how-to-use/        # 予約方法ページ
│   ├── japan-info/        # 日本情報ページ
│   ├── privacy-policy/    # プライバシーポリシーページ
│   ├── request/           # リクエストフォームページ
│   ├── reservation/       # 予約管理ページ
│   ├── restaurants/       # レストラン一覧・詳細ページ
│   ├── reviews/           # レビューページ
│   ├── search/            # 検索ページ
│   ├── service/           # サービス紹介ページ
│   ├── terms/             # 利用規約ページ
│   ├── write-review/      # レビュー投稿ページ
│   ├── layout.tsx         # アプリケーション全体のレイアウト
│   └── page.tsx           # メインページ
├── components/            # 再利用可能なコンポーネント
│   ├── restaurant/        # レストラン関連コンポーネント
│   ├── ui/                # UIコンポーネント
│   ├── hero-section.tsx   # ヒーローセクションコンポーネント
│   ├── category-buttons.tsx # カテゴリーボタンコンポーネント
│   ├── popular-restaurants.tsx # 人気レストランコンポーネント
│   ├── service-features.tsx # サービス特徴コンポーネント
│   ├── customer-reviews.tsx # お客様の声コンポーネント
│   ├── cta-banner.tsx     # CTAバナーコンポーネント
│   ├── global-header.tsx  # グローバルヘッダーコンポーネント
│   └── footer.tsx         # フッターコンポーネント
├── contexts/              # コンテキストプロバイダー
│   └── language-context.tsx # 言語切り替えコンテキスト
├── hooks/                 # カスタムフック
│   ├── use-language.ts    # 言語フック
│   └── use-restaurants.ts # レストランデータフック
├── lib/                   # ユーティリティ関数
│   ├── supabase-server.ts # サーバーサイドSupabaseクライアント
│   ├── supabase.ts        # クライアントサイドSupabaseクライアント
│   └── utils.ts           # 汎用ユーティリティ関数
├── public/                # 静的アセット
│   ├── icons/             # アイコンファイル
│   │   ├── icon-192x192.png # PWAアイコン(192x192)
│   │   ├── icon-512x512.png # PWAアイコン(512x512)
│   │   └── apple-touch-icon.png # Appleタッチアイコン
│   ├── images/            # 画像ファイル
│   ├── og/                # OG画像ファイル
│   ├── favicons/          # ファビコンファイル
│   ├── manifest.json      # PWAマニフェスト
│   ├── service-worker.js  # サービスワーカー
│   ├── clear-cache.js     # キャッシュクリアスクリプト
│   ├── robots.txt         # ロボット制御ファイル
│   └── sitemap.xml        # サイトマップ
├── tests/                 # テストファイル
│   └── e2e/               # E2Eテスト
├── supabase/              # Supabase関連ファイル
│   └── migrations/        # データベースマイグレーション
├── deployment/            # デプロイメント関連ファイル
├── .cursor/               # Cursor IDE設定
├── .vscode/               # VSCode設定
├── .env                   # 環境変数
├── .env.development       # 開発環境変数
├── .env.production        # 本番環境変数
├── .env.test              # テスト環境変数
├── .eslintrc.json         # ESLint設定
├── next.config.js         # Next.js設定
├── tailwind.config.js     # Tailwind CSS設定
├── tailwind.config.ts     # Tailwind CSS型定義
├── tsconfig.json          # TypeScript設定
├── package.json           # パッケージ設定
├── README.md              # プロジェクト説明
├── SPECIFICATION.md       # 仕様書
└── GUIDELINES.md          # 開発ガイドライン
```

### 3.2 主要ページ

1. **メインページ** (`/app/page.tsx`)
   - ホーム画面
   - 言語切り替え機能
   - カテゴリーナビゲーション
   - 人気レストラン一覧
   - サービス特徴紹介
   - お客様の声
   - CTAセクション
   - フッター（プライバシーポリシー、特定商取引法リンク）

2. **FAQページ** (`/app/faq/page.tsx`)
   - よくある質問と回答
   - 韓国語/日本語切り替え機能

3. **予約方法ページ** (`/app/how-to-use/page.tsx`)
   - サービス利用方法の説明
   - 予約手順のステップバイステップガイド
   - 韓国語/日本語切り替え機能

4. **プライバシーポリシーページ** (`/app/privacy-policy/page.tsx`)
   - プライバシーポリシー全文
   - 韓国語/日本語切り替え機能

5. **利用規約ページ** (`/app/terms/page.tsx`)
   - 利用規約全文
   - 韓国語/日本語切り替え機能

6. **サービス紹介ページ** (`/app/service/page.tsx`)
   - IRUTOMOサービスの概要説明
   - サービスの特徴紹介
   - 利用方法の説明
   - よくある質問
   - 韓国語/日本語切り替え機能

7. **食堂リストページ** (`/app/restaurants/page.tsx`)
   - 食堂一覧の表示
   - 地域（大阪、東京、京都）によるフィルタリング機能
   - 各食堂の詳細情報（名前、評価、タグ、地域）
   - 詳細を見るボタンと地図リンク
   - 韓国語/日本語切り替え機能
   - モバイルファーストデザイン

8. **店舗詳細ページ** (`/app/restaurants/[id]/page.tsx`)
   - 店舗写真スライダー（4枚の写真を表示）
   - 店舗情報の詳細表示（店名、住所、説明文など）
   - 予約フォーム（予約者名、予約人数、電話番号、メールアドレス、追加リクエスト）
   - PayPal決済機能（代行手数料の支払い）
     - スクリプト読み込み状態の管理
     - ローディング表示
     - エラーハンドリングの強化
   - 決済成功時のモーダル表示（「代行手数料の支払いが完了しました！担当者が予約を急ぎます！予約成立後、予約完了メールが届きます。予約不成立時も100％返金します。」）
   - 韓国語/日本語切り替え機能
   - ISR（Incremental Static Regeneration）対応
   - モバイルファーストデザイン
   - Clerk認証機能

9. **リクエストフォームページ** (`/app/request/page.tsx`)
   - 予約リクエスト用フォーム
   - 必須項目（食堂名、住所/電話番号、予約者名、人数、メールアドレス）
   - 追加リクエスト入力欄（任意）
   - PayPal決済機能（代行手数料の支払い）
     - スクリプト読み込み状態の管理
     - ローディング表示
     - エラーハンドリングの強化
     - 決済成功時のモーダル表示
   - 韓国語/日本語切り替え機能

   **PayPal決済実装**:
   - ファイル構成:
     - `app/request/paypalConfig.ts` - PayPalの設定を集中管理
     - `app/request/request-content.tsx` - PayPalボタンとフォームの実装

   ```typescript
   // paypalConfig.ts
   export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
   export const PAYPAL_MODE = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';
   export const PAYMENT_AMOUNT = 1000; // 手数料1000円

   export const paypalConfig = {
     clientId: PAYPAL_CLIENT_ID,
     currency: 'JPY',
     intent: 'capture',
     components: 'buttons',
     disableFunding: 'paylater,venmo,card',
   };
   ```

   ```tsx
   // request-content.tsx 内のPayPal実装部分
   import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
   import { paypalConfig, PAYMENT_AMOUNT } from './paypalConfig';

   // コンポーネント内
   <PayPalScriptProvider options={paypalConfig}>
     <PayPalButtons 
       style={{ layout: "vertical" }}
       createOrder={(data, actions) => {
         return actions.order.create({
           intent: "CAPTURE",
           purchase_units: [
             {
               amount: {
                 currency_code: "JPY",
                 value: PAYMENT_AMOUNT.toString()
               },
               description: `${formData.restaurantName || "食堂"} - ${formData.numberOfPeople || "1"}名様`
             }
           ],
           application_context: {
             shipping_preference: "NO_SHIPPING"
           }
         });
       }}
       onApprove={(data, actions) => {
         if (!actions.order) {
           console.error("PayPal actions.orderが利用できません");
           return Promise.reject("PayPal actions.order not available");
         }
         
         return actions.order.capture().then((details) => {
           console.log("決済が完了しました:", details);
           // 成功した場合、成功モーダルを表示
           setIsSubmitted(true);
           setPaymentError(null);
         });
       }}
       onError={(err) => {
         console.error("PayPal決済エラー:", err);
         setPaymentError(t.paymentError);
       }}
     />
   </PayPalScriptProvider>
   ```

10. **管理者返金ページ** (`/app/admin/refund/page.tsx`)
    - 管理者認証機能
    - 返金処理フォーム（PayPal取引ID、返金金額、メールアドレス、返金理由）
    - 返金処理結果の表示
    - PayPal APIを使用した返金処理

11. **返金処理API** (`/app/api/refund/route.ts`)
    - PayPal APIを使用した返金処理
    - 返金完了通知メール送信機能
    - エラーハンドリング

## 4. 実装仕様と機能

### 4.1 言語切り替え機能

**実装**: `contexts/language-context.tsx`

- ローカルストレージを使用して言語設定を保存
- アプリケーション全体で言語設定を共有
- 国旗アイコン（🇰🇷/🇯🇵）でユーザーフレンドリーな切り替えUI
- 全ページで共通の言語コンテキストを使用

```tsx
// 言語プロバイダーの使用例
<LanguageProvider>
  {children}
</LanguageProvider>

// 各コンポーネントでの使用
const { language, setLanguage } = useLanguage();
```

### 4.2 ナビゲーション

**メインカテゴリー**:

1. 人気店舗（🍜）- `/restaurants` ページにリンク
2. 予約方法（📱）- `/how-to-use` ページにリンク
3. 日本情報（🗺️）- Instagram外部リンク `https://www.instagram.com/irutomo__kr`
4. ガイド（💬）- 外部リンク `https://irutomops.studio.site`
5. FAQ（❓）- `/faq` ページにリンク

**その他のナビゲーション**:
- ヒーローセクションの「いますぐ予約する」ボタン - `/restaurants` ページにリンク
- 「もっと見る」ボタン - `/restaurants` ページにリンク
- CTAセクションの「リクエストする」ボタン - `/request` ページにリンク

### 4.3 データ構造

**言語データ**:

```tsx
const translations = {
  ko: {
    // 韓国語のテキストデータ
  },
  ja: {
    // 日本語のテキストデータ
  }
};
```

**レストランデータ**:

```tsx
interface Restaurant {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  location?: string;
  address?: string;
  cuisine?: string;
  price_range?: string;
  rating?: number;
  google_maps_link?: string;
  created_at?: string;
  tags?: string[];
  popular?: boolean;
}
```

**お客様の声データ**:

```tsx
const testimonials = [
  {
    text: {
      ko: "レビューテキスト（韓国語）",
      ja: "レビューテキスト（日本語）"
    },
    name: {
      ko: "名前（韓国語）",
      ja: "名前（日本語）"
    },
    location: {
      ko: "場所（韓国語）",
      ja: "場所（日本語）"
    },
    date: "2024/5/15",
    rating: 5,
    restaurant: {
      ko: "レストラン名（韓国語）",
      ja: "レストラン名（日本語）"
    }
  },
  // 他のレビュー...
];
```

## 5. スタイリング

- **ベーススタイル**: Tailwind CSS
- **プライマリカラー**: `#00CBB3`（ティール）
- **セカンダリカラー**: `#FFA500`（オレンジ）
- **アクセントカラー**: `#E64DFF`（パープル）- 予約方法ページで使用
- **背景色**: `#F8F8F8`（ライトグレー）
- **テキストカラー**: `#002233`（ダークグレー）
- **フォント**: Noto Sans KR（韓国語、日本語両対応）

## 6. アニメーションとインタラクション

- ホバーエフェクト: カードやボタンでスケールや色の変化
- 言語切り替え: アクティブな言語は拡大表示（scale 1.2）
- 非アクティブな言語: 半透明表示（opacity 0.5）
- カテゴリーボタン: ホバー時に背景色が変化し、スケールが微増（scale 1.02）

## 7. ページ間の連携

- 言語設定の保持: ページ遷移時に選択された言語を維持
- 一貫したナビゲーション: 全ページに戻るボタンを配置
- 共通のヘッダーレイアウト: 言語切り替えボタンを統一配置
- 共通のカードコンポーネント: 一貫したデザインを維持

## 8. 外部リンク

- Instagram: `https://www.instagram.com/irutomo__kr`
- 公式サイト: `https://irutomops.studio.site`
- 問い合わせメール: `gespokrofficial@gmail.com`

## 9. レスポンシブデザイン

- モバイルファースト設計
- 最大幅: `max-w-md`（モバイルアプリのような表示）
- スマートフォン向け最適化ビュー
- メディアクエリ: `md:` (768px以上)、`lg:` (1024px以上)

## 10. 今後の開発方針

### 10.1 優先実装項目

1. 予約機能の強化
   - 日付、時間選択の改善
   - 予約状況の可視化
   - キャンセルポリシーの明確化

2. ユーザーアカウント機能の強化
   - マイページの機能拡充
   - お気に入りレストランの管理
   - 予約履歴の詳細表示

3. 予約管理システムの改善
   - 管理者向けダッシュボードの強化
   - 予約状況の一覧表示
   - 予約データのエクスポート機能

4. レビュー投稿機能の実装
   - ユーザーによるレビュー投稿
   - 星評価システム
   - 写真アップロード機能

### 10.2 中長期的な機能拡張

1. 食堂オーナー向け管理画面
   - 店舗情報の編集機能
   - 予約状況の確認
   - 特別メニューの登録

2. 多言語対応の拡大
   - 英語対応
   - 中国語対応

3. 検索・フィルター機能の強化
   - 料理ジャンルによる絞り込み
   - 価格帯による絞り込み
   - キーワード検索機能

4. パフォーマンスの最適化
   - 画像の最適化
   - キャッシュ戦略の改善
   - ページ読み込み速度の向上

## 11. コーディングルール

1. **言語標準**:
   - 言語データは必ず `translations` オブジェクトに定義
   - 新しいページを作成する際は韓国語と日本語の両方に対応
   - すべての表示テキストは多言語対応

2. **コンポーネント設計**:
   - 再利用可能なコンポーネントは `components/` ディレクトリに配置
   - 言語切り替えは必ず `useLanguage` フックを使用
   - 型定義を適切に行い、TypeScriptの恩恵を最大化

3. **スタイリング**:
   - Tailwind CSSクラスを使用
   - カラーパレットを維持（`primary`, `secondary`, `accent`, `background`, `text`）
   - 一貫したスペーシングとサイズ

4. **データ管理**:
   - 言語データは言語コンテキストから取得
   - Supabaseとの連携は適切なエラーハンドリングを実施
   - 外部API通信時は適切なローディング状態を表示

5. **パフォーマンス考慮事項**:
   - 画像の最適化（Next.jsのImageコンポーネントを使用）
   - 不要なレンダリングの回避
   - 適切なキャッシュ戦略の実装

## 12. セキュリティ対策

1. **認証**:
   - Clerk認証システムを使用
   - 適切な権限設定による保護
   - セッション管理の適切な実装

2. **決済**:
   - PayPal APIを使用した安全な決済処理
   - 決済情報の適切な保護
   - エラーハンドリングの強化

3. **データ保護**:
   - 個人情報の適切な取り扱い
   - Supabaseのセキュリティ設定の最適化
   - 環境変数による機密情報の保護

## 13. インフラストラクチャと品質保証

### 13.1 パフォーマンス最適化

1. **Next.js設定の最適化**
   - サーバーミニフィケーションの有効化
   - パッケージインポートの最適化（react-icons, lucide-react, framer-motion, date-fns）
   - SVGファイルの最適な取り扱い（@svgr/webpack）
   - 画像フォーマットとしてWebPを優先使用

2. **画像最適化**
   - `next/image`コンポーネントによる自動最適化
   - 画像のキャッシュTTLを3600秒に設定
   - LCPに影響する重要な画像に`priority`属性を使用
   - 画像のリモートパターン設定による安全な画像読み込み

3. **キャッシュ戦略**
   - Service Workerによるキャッシュ管理
   - オフライン対応のためのキャッシュファースト戦略
   - 動的コンテンツのネットワークファースト戦略
   - APIレスポンスの適切なキャッシュ

4. **バンドル最適化**
   - Tree-shakingによる未使用コードの削除
   - コンポーネントの動的インポート
   - `next/dynamic`を使用した必要に応じたコンポーネントの読み込み

### 13.2 セキュリティ強化

1. **CSPヘッダー設定**
   - コンテンツセキュリティポリシーの詳細な設定
   - CSP違反の報告エンドポイント（`/api/csp-report`）
   - CSP違反の詳細ロギングとモニタリング

2. **セキュリティヘッダー**
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - X-Frame-Options: SAMEORIGIN
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: camera=(), microphone=(), geolocation=(self), interest-cohort=()

3. **認証フロー**
   - Supabase認証の安全な実装
   - JWTトークン管理
   - クッキーベースのセッション管理

4. **環境変数管理**
   - 開発環境と本番環境の分離
   - 機密情報の適切な管理
   - .env.development, .env.production, .env.testの適切な区分け

### 13.3 コード品質と標準化

1. **ESLint設定**
   - next/core-web-vitalsとnext/typescriptの拡張
   - 未使用変数の警告（no-unused-vars: warn）
   - コンソール出力の制限（no-console: warn, allow: ["warn", "error"]）
   - Reactフックのルール強制（react-hooks/rules-of-hooks: error）
   - 依存配列の検証（react-hooks/exhaustive-deps: warn）

2. **TypeScript型安全性**
   - 厳密なnull/undefinedチェック
   - 適切なインターフェース定義
   - レスポンスデータの型付け
   - APIルートの型定義

3. **コンポーネント設計原則**
   - 単一責任の原則
   - 分離された関心事
   - 再利用可能なコンポーネント
   - 適切なprops渡し

### 13.4 テスト戦略

1. **ユニットテスト**
   - Vitestを使用したコンポーネントテスト
   - MSWによるAPIモック
   - React Testing Libraryによるコンポーネントテスト

2. **E2Eテスト**
   - Playwrightによるエンドツーエンドテスト
   - クロスブラウザテスト
   - モバイル対応テスト

3. **統合テスト**
   - APIエンドポイントのテスト
   - 認証フローのテスト
   - データフローの検証

### 13.5 PWA対応

1. **マニフェスト設定**
   - アプリ名、短い名前、説明
   - アイコン設定（192x192, 512x512, 180x180）
   - テーマカラー（#00CBB3）
   - 背景色（#FFFFFF）
   - ショートカット機能（レストラン検索、予約確認）
   - スクリーンショット

2. **Service Worker機能**
   - オフラインサポート
   - キャッシュ管理
   - プッシュ通知対応
   - バックグラウンド同期
   - キャッシュクリア機能

3. **インストール体験**
   - インストールプロンプト
   - アプリケーションアイコン
   - スプラッシュスクリーン

### 13.6 モニタリングと分析

1. **パフォーマンスモニタリング**
   - Vercel Analyticsによるパフォーマンス計測
   - Web Vitals（LCP, FID, CLS, TTFB）の監視
   - リアルユーザーモニタリング

2. **エラー追跡**
   - クライアントサイドエラーのロギング
   - サーバーサイドエラーの集約
   - CSP違反レポートの監視

3. **ユーザー行動分析**
   - ページ遷移の追跡
   - コンバージョンフローの分析
   - ユーザーセグメンテーション

## 14. デプロイメントとDevOps

### 14.1 デプロイメントパイプライン

1. **Vercelデプロイフロー**
   - GitHub連携によるCI/CD
   - プレビューデプロイメント
   - 本番環境デプロイ

2. **環境分離**
   - 開発環境
   - ステージング環境
   - 本番環境

3. **ロールバック戦略**
   - デプロイメントの自動ロールバック
   - 手動ロールバックプロセス
   - デプロイメント履歴管理

### 14.2 保守と運用

1. **バックアップ戦略**
   - データベースの定期バックアップ
   - ファイルストレージのバックアップ
   - 設定ファイルのバージョン管理

2. **監視システム**
   - サーバーステータスの監視
   - API応答時間のモニタリング
   - エラー率のアラート

3. **ドキュメンテーション**
   - API仕様書
   - コンポーネント設計ドキュメント
   - 運用手順書

---

このドキュメントは、IRUTOMOプロジェクトの設計と実装の指針となるものです。今後の開発作業はこの仕様に基づいて行われ、変更が必要な場合は本ドキュメントを更新してください。

**最終更新日**: 2024年6月10日
