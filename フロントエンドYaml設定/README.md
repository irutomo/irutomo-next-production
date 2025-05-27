# Strapi v5 Japan Info Article フロントエンド設定

このディレクトリには、Strapi v5 Japan Info Article コンテンツタイプをフロントエンドで効率的に利用するための設定ファイル、型定義、実装例が含まれています。

## 📁 ファイル構成

### 設定ファイル
- **`strapi-integration.yml`** - Strapi統合設定（メイン設定ファイル）
- **`typescript-types.ts`** - TypeScript型定義
- **`react-components-example.tsx`** - React実装例（シンプル版）
- **`nextjs-implementation-example.tsx`** - Next.js App Router実装例
- **`README.md`** - 本ファイル

## 🚀 クイックスタート

### 1. TypeScript型定義の利用

```typescript
import { JapanInfoArticle, StrapiClient } from './typescript-types';

// APIクライアントの初期化
const strapiClient = new StrapiClient('http://localhost:1337');

// 記事一覧の取得
const articles = await strapiClient.getArticles('ja');
```

### 2. React コンポーネントの使用

```tsx
import { JapanInfoApp } from './react-components-example';

function App() {
  return <JapanInfoApp />;
}
```

### 3. Next.js での実装

```tsx
// app/japan-info/page.tsx
import { ArticlesPage } from './nextjs-implementation-example';

export default ArticlesPage;
```

## 🔧 設定の詳細

### YAML設定ファイル (`strapi-integration.yml`)

#### API基本設定
```yaml
api:
  base:
    url: "http://localhost:1337"
    version: "v5"
    timeout: 10000
    retries: 3
```

#### エンドポイント設定
```yaml
endpoints:
  japan_info:
    collection: "/api/japan-info-articles"
    single: "/api/japan-info-articles/{id}"
    popular: "/api/japan-info-articles?filters[isPopular][$eq]=true"
```

#### 多言語設定
```yaml
locales:
  default: "ja"
  supported: ["ja", "ko", "en"]
  fallback: "ja"
```

### フィールド構造

#### 基本フィールド
- `title` (string) - 記事タイトル（日本語）
- `koreanTitle` (string, optional) - 記事タイトル（韓国語）
- `description` (text) - 記事概要
- `content` (richtext) - 記事本文
- `imageUrl` (string) - メイン画像URL

#### メタデータフィールド
- `tags` (array) - 記事タグ
- `location` (string) - 関連場所・地域
- `slug` (string) - URL用スラッグ
- `isPopular` (boolean) - 人気記事フラグ
- `views` (integer) - 閲覧数
- `author` (string) - 著者名

## 🎯 使用例

### APIクライアントの基本使用法

```typescript
// 記事一覧の取得
const response = await strapiClient.getArticles({
  locale: 'ja',
  pagination: { page: 1, pageSize: 12 },
  sort: ['publishedAt:desc']
});

// 人気記事の取得
const popularArticles = await strapiClient.getPopularArticles({
  locale: 'ja',
  pagination: { pageSize: 6 }
});

// 記事詳細の取得
const article = await strapiClient.getArticle('document-id', {
  locale: 'ja'
});
```

### Reactコンポーネントの実装

```tsx
import { useArticles } from './react-components-example';

function ArticlesComponent() {
  const { articles, loading, error, refetch } = useArticles('ja');

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      {articles.map(article => (
        <ArticleCard 
          key={article.documentId} 
          article={article} 
          locale="ja" 
        />
      ))}
    </div>
  );
}
```

### 多言語対応の実装

```typescript
import { getLocalizedTitle, getLocalizedContent } from './react-components-example';

function LocalizedArticle({ article, locale }: { article: JapanInfoArticle, locale: string }) {
  const title = getLocalizedTitle(article, locale);
  const content = getLocalizedContent(article, locale);

  return (
    <article>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

## 🎨 UI実装のベストプラクティス

### レスポンシブデザイン
```css
/* 記事一覧グリッド */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
```

### 画像最適化
```tsx
// Next.js Image コンポーネントの使用
import Image from 'next/image';

<Image
  src={article.attributes.imageUrl}
  alt={getLocalizedTitle(article, locale)}
  width={600}
  height={400}
  className="object-cover rounded-lg"
  priority={index < 3} // 上位3件は優先読み込み
/>
```

### パフォーマンス最適化
```typescript
// React.memo でコンポーネントのメモ化
const ArticleCard = React.memo(({ article, locale }: ArticleCardProps) => {
  // コンポーネント実装
});

// useMemo でデータの計算結果をキャッシュ
const localizedData = useMemo(() => ({
  title: getLocalizedTitle(article, locale),
  description: getLocalizedDescription(article, locale),
}), [article, locale]);
```

## 🔍 SEO対応

### Next.js Metadataの生成
```typescript
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await strapiClient.getArticle(params.id);
  
  return {
    title: `${article.attributes.title} | IRUTOMO`,
    description: article.attributes.description,
    openGraph: {
      title: article.attributes.title,
      description: article.attributes.description,
      images: [article.attributes.imageUrl],
      type: 'article',
    },
  };
}
```

### 構造化データの実装
```tsx
function ArticleStructuredData({ article }: { article: JapanInfoArticle }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.attributes.title,
    "description": article.attributes.description,
    "image": article.attributes.imageUrl,
    "author": {
      "@type": "Person",
      "name": article.attributes.author || "IRUTOMO編集部"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IRUTOMO",
    },
    "datePublished": article.attributes.publishedAt,
    "dateModified": article.attributes.updatedAt,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

## 🛠 開発ツール

### ESLint設定
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Prettier設定
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 🚀 デプロイメント

### 環境変数の設定
```bash
# .env.local
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-instance.com
STRAPI_API_TOKEN=your-api-token

# Vercel デプロイ時
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-instance.com
```

### ビルド最適化
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-strapi-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/api/strapi/:path*',
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

## 📊 パフォーマンス監視

### Web Vitals の測定
```typescript
// pages/_app.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === 'web-vital') {
    console.log(metric); // Analytics に送信
  }
}
```

### エラー監視
```typescript
// lib/error-reporting.ts
export function reportError(error: Error, context: string) {
  console.error(`[${context}] ${error.message}`, error);
  // Sentry などのエラー追跡サービスに送信
}
```

## 📝 利用例とテンプレート

### 基本的なページ構成
```
app/
├── japan-info/
│   ├── page.tsx              # 記事一覧ページ
│   ├── [documentId]/
│   │   └── page.tsx          # 記事詳細ページ
│   └── popular/
│       └── page.tsx          # 人気記事ページ
├── components/
│   ├── ArticleCard.tsx
│   ├── ArticleList.tsx
│   └── ArticleDetail.tsx
└── lib/
    ├── strapi-client.ts
    └── types.ts
```

### カスタマイズ例
```typescript
// カスタム検索機能
export function useArticleSearch(query: string, locale: string = 'ja') {
  const [results, setResults] = useState<JapanInfoArticle[]>([]);
  
  useEffect(() => {
    if (query.length >= 2) {
      strapiClient.searchArticles(query, { locale }).then(response => {
        setResults(response.data);
      });
    } else {
      setResults([]);
    }
  }, [query, locale]);
  
  return results;
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **CORS エラー**
   ```javascript
   // Strapi config/middlewares.js
   module.exports = [
     'strapi::cors',
     // その他のミドルウェア
   ];
   ```

2. **型エラー**
   ```typescript
   // 型アサーションの使用
   const article = response.data as JapanInfoArticle;
   ```

3. **画像読み込みエラー**
   ```tsx
   // フォールバック画像の設定
   <img
     src={imageUrl}
     alt={title}
     onError={(e) => {
       e.currentTarget.src = '/fallback-image.jpg';
     }}
   />
   ```

## 📚 参考資料

- [Strapi v5 公式ドキュメント](https://docs.strapi.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [React 公式ドキュメント](https://react.dev/)

## 🤝 コントリビューション

プルリクエストや Issue は歓迎です。新機能や改善提案がある場合は、まず Issue を作成してください。

## 📄 ライセンス

MIT License - 詳細は LICENSE ファイルを参照してください。 