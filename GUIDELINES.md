# IRUTOMO 開発ガイドライン

## 1. 開発ルール

### 1.1 言語とコーディング規約

- **命名規則**:
  - コンポーネント: PascalCase (例: `ReservationForm.tsx`)
  - 関数・変数: camelCase (例: `useLanguage`, `currentState`)
  - 定数: SCREAMING_SNAKE_CASE (例: `MAX_ITEMS`)
  - CSS/Tailwindクラス: kebab-case (例: `max-w-md`)

- **ファイル構造**:
  - コンポーネントファイルには1つの主要エクスポートのみを含める
  - 関連するヘルパー関数は同じファイル内に定義する
  - 複数の場所で使用されるユーティリティは`lib/`ディレクトリに配置

- **コメント**:
  - 複雑なロジックには日本語または英語でコメントを追加
  - 一時的な解決策にはTODOコメントを追加
  - SVGコンポーネントなど、目的が明確な要素には簡潔な説明を付ける

### 1.2 多言語対応のルール

- すべての表示テキストは`translations`オブジェクトに定義すること
- 新しいページを作成する際は必ず韓国語と日本語の両方を実装
- 言語切り替えには必ず`useLanguage`フックを使用
- 翻訳テキストは以下の構造に従う:

```tsx
const translations = {
  ko: {
    // 韓国語のコンテンツ
  },
  ja: {
    // 日本語のコンテンツ
  }
};
```

### 1.3 コンポーネント設計

- 再利用可能なコンポーネントは`components/`ディレクトリに配置
- ページレベルのコンポーネントは`app/`ディレクトリ内に配置
- コンポーネントは適切に型付けし、TypeScriptの型定義を使用
- SVGアイコンは直接コンポーネントとして実装し、依存性を削減

### 1.4 スタイリング

- Tailwind CSSを一貫して使用
- カラーパレットを維持:
  - プライマリ: `#00CBB3` (ティール)
  - セカンダリ: `#FFA500` (オレンジ)
  - アクセント: `#E64DFF` (パープル)
  - 背景: `#F8F8F8` (ライトグレー)
  - テキスト: `#002233` (ダークグレー)
- レスポンシブデザインのアプローチ:
  - モバイルファーストデザイン
  - `max-w-md`をコンテナに使用してモバイルアプリのような表示を維持

## 2. 新機能の実装ガイドライン

### 2.1 新ページの追加

新しいページを追加する際の手順:

1. `app/[page-name]/page.tsx`を作成
2. 言語切り替え機能を実装:
   ```tsx
   'use client';
   import { useLanguage } from '@/contexts/language-context';
   
   export function PageName() {
     const { language } = useLanguage();
     // ...
   }
   ```
3. 両言語のコンテンツを定義:
   ```tsx
   const translations = {
     ko: { /* 韓国語コンテンツ */ },
     ja: { /* 日本語コンテンツ */ }
   };
   ```
4. 戻るボタンと言語切り替えボタンをヘッダーに追加
5. メインコンテンツをCardコンポーネントでラップ
6. 必要に応じてナビゲーションを追加

### 2.2 予約システムの実装

予約機能を追加する際の要件:

1. 日付選択機能
   - カレンダーコンポーネントの実装
   - 予約可能日の表示

2. 時間選択
   - 時間帯の選択UI
   - 予約済み時間の非表示または無効化

3. 人数選択
   - 最小/最大人数の制限
   - 料金計算との連携

4. 顧客情報フォーム
   - 必須情報: 名前、連絡先、メールアドレス
   - バリデーション実装

5. 確認画面
   - 予約内容の表示
   - 変更・キャンセルオプション

6. 完了画面
   - 予約番号の発行
   - 確認メール送信機能

### 2.3 Supabaseとの連携

1. データ取得の基本パターン
   ```tsx
   import { createServerComponentClient } from '@/lib/supabase';
   
   async function getData() {
     try {
       const supabase = await createServerComponentClient();
       const { data, error } = await supabase
         .from('table_name')
         .select('*');
       
       if (error) {
         console.error('エラー:', error);
         return [];
       }
       
       return data || [];
     } catch (error) {
       console.error('エラーが発生しました:', error);
       return [];
     }
   }
   ```

2. 環境変数の使用
   - 必ずプロジェクトルートの`.env`ファイルに定義
   - フロントエンドで使用する変数には`NEXT_PUBLIC_`プレフィックスを付ける

## 3. テスト戦略

### 3.1 手動テスト

各機能実装後、以下の点を必ずテストする:

- 言語切り替えが正常に動作するか
- リンク先が正しいか
- レスポンシブデザインが崩れていないか
- ユーザーフローが直感的か

### 3.2 ブラウザ互換性

以下のブラウザで動作確認:

- Chrome (最新版)
- Safari (最新版)
- Firefox (最新版)
- モバイル: iOS Safari, Android Chrome

## 4. 認証と決済に関するガイドライン

### 4.1 Clerk認証システム

- Clerk認証は必要に応じて一時的に無効化可能
- 認証を必要とするページは`middleware.ts`で制御
- 公開ルートは明示的に定義:

```tsx
// 公開ルート（認証なしでアクセス可能）
const publicRoutes = [
  '/',
  '/service',
  '/restaurants',
  '/restaurants/(.*)',
  // ...その他の公開ルート
];
```

### 4.2 PayPal決済システム

- PayPal APIの統合には`@paypal/react-paypal-js`を使用
- 決済フローの実装:
  1. 注文作成 (`/api/paypal/create-order/`)
  2. 決済処理 (`/api/paypal/capture-order/`)
  3. 必要に応じて払い戻し処理 (`/api/paypal/refund/`)

#### PayPal設定ファイルの使用方法

`paypalConfig.ts`を作成し、PayPalの設定を集中管理します:

```typescript
// PayPal設定
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

PayPalScriptProviderの実装例:

```tsx
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
      // 支払い完了処理
      return actions.order.capture().then((details) => {
        // 成功時の処理
        setIsSubmitted(true);
      });
    }}
    onError={(err) => {
      // エラー処理
      setPaymentError("決済処理中にエラーが発生しました");
    }}
  />
</PayPalScriptProvider>
```

PayPal決済機能の実装に関する重要な注意点:
- スクリプト読み込み状態の監視と適切なローディング表示の実装
- エラーハンドリングの実装（ネットワークエラー、ユーザーキャンセル、PayPalの内部エラーなど）
- 決済成功時のユーザーフローの設計（確認画面表示、データベース更新など）

## 5. デプロイプロセス

1. コードレビュー
2. テスト環境でのデプロイと確認
3. 本番環境へのデプロイ
   - 本番環境用の`.env.deploy`ファイルを使用
   - FTP接続情報を適切に設定
4. デプロイ後の動作確認

## 6. プロジェクト進行状況と優先度

### 6.1 完了した機能

- [x] メインページの基本レイアウト
- [x] 言語切り替え機能
- [x] FAQページ
- [x] 予約方法ページ
- [x] プライバシーポリシーページ
- [x] 特定商取引法ページ
- [x] 食堂リストページ
- [x] リクエストフォーム
- [x] 店舗詳細ページ
- [x] PayPal決済機能
- [x] Clerk認証システム
- [x] マイページ機能（予約履歴、お気に入り）

### 6.2 次の優先事項

- [ ] レストラン検索・フィルター機能の強化
- [ ] レビュー投稿機能の実装
- [ ] 食堂オーナー向け管理画面の開発
- [ ] 予約管理システムの改善
- [ ] パフォーマンスの最適化

## 7. 開発時の注意事項

- **変更前の確認**: 既存のコードや設計パターンを確認してから実装
- **コミットメッセージ**: 日本語または英語で明確な変更内容を記述
- **依存関係の追加**: 新しいライブラリを追加する場合は事前に相談
- **パフォーマンス**: 大きな画像や重いライブラリの使用を避ける
- **アクセシビリティ**: 基本的なアクセシビリティ要件を満たすこと
- **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージを表示
- **認証関連**: Clerk認証機能を使用する場合は、適切な権限設定を行う
- **環境変数**: 本番環境と開発環境で異なる環境変数を適切に管理

## 8. 技術スタック

- **フロントエンド**: 
  - Next.js 15.2.0
  - React 19.0.0
  - TypeScript 5.4.5
  - Tailwind CSS 3.4.1

- **バックエンド**:
  - Supabase (データストレージ)
  - Clerk (認証)
  - PayPal API (決済)

- **デプロイ**:
  - Core Server (FTP)

---

このガイドラインは開発の進行に伴い更新されます。質問や提案があれば共有してください。

**最終更新日**: 2025年4月7日
