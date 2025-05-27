# StrapiとIRUTOMO連携マニュアル（v5対応版）

このマニュアルは、RailwayにホストされているStrapi v5プロジェクトとIRUTOMOの日本情報ページを連携させる包括的な手順を説明します。

## 前提条件

- Strapi v5.0.x以上
- Node.js v18.x.x または v20.x.x
- Railway アカウント
- IRUTOMOプロジェクトへのアクセス権

## 1. Strapiの設定

### 1.1 開発環境の確認

まず、Strapiのバージョンを確認します：

```bash
npx create-strapi-app@latest --version
# または既存プロジェクトで
npm list strapi
```

### 1.2 コンテンツタイプの作成

#### 1.2.1 コンテンツタイプビルダーへのアクセス

1. Strapi管理画面（`http://localhost:1337/admin`）にログインします
2. **Content-Type Builder** をクリックします
3. **Create new collection type** をクリックします

#### 1.2.2 基本設定の入力

4. コンテンツタイプの基本情報を入力します：
   - **Display name**: `日本情報記事`
   - **API ID (singular)**: `japan-info-article`
   - **API ID (plural)**: `japan-info-articles`

5. **Advanced Settings** タブで以下を設定：
   - ✅ **Draft & Publish**: 記事の下書き機能を有効化
   - ✅ **Internationalization**: 多言語対応を有効化（必要に応じて）

6. **Continue** をクリックします

#### 1.2.3 フィールド構成の詳細設計

以下のフィールドを順次追加します：

| フィールド名 | タイプ | 必須 | 詳細設定 | 説明 |
|------------|------|------|---------|------|
| title | Text (Short) | ✅ | Max: 255文字, Min: 3文字 | 記事のタイトル（日本語） |
| koreanTitle | Text (Short) | ❌ | Max: 255文字 | 記事のタイトル（韓国語） |
| description | Text (Long) | ✅ | - | 記事の概要（日本語） |
| koreanDescription | Text (Long) | ❌ | - | 記事の概要（韓国語） |
| content | Rich Text (Blocks) | ✅ | - | 記事の本文（日本語） |
| koreanContent | Rich Text (Blocks) | ❌ | - | 記事の本文（韓国語） |
| imageUrl | Text (Short) | ✅ | RegExp: URL形式 | 記事のメイン画像URL |
| images | JSON | ❌ | - | 記事の追加画像URL（配列） |
| tags | JSON | ❌ | - | 記事のタグ（配列） |
| location | Text (Short) | ❌ | Max: 100文字 | 記事に関連する場所や地域 |
| isPopular | Boolean | ❌ | Default: false | 人気記事フラグ |
| author | Text (Short) | ❌ | Max: 50文字 | 記事の著者名 |
| views | Number (Integer) | ❌ | Default: 0, Min: 0 | 記事の閲覧数 |
| embedLinks | JSON | ❌ | - | 埋め込みリンク情報 |
| slug | UID | ✅ | Target field: title | URLに使用される一意の識別子 |

7. 各フィールドの **Advanced Settings** で適切な設定を行います：
   - **Private field**: APIで公開しないフィールドにチェック
   - **Required field**: 必須フィールドにチェック
   - **Enable localization**: 多言語対応フィールドにチェック

8. **Save** をクリックしてコンテンツタイプを保存します

### 1.3 APIアクセス権限の設定

#### 1.3.1 パブリックアクセスの設定

1. **Settings** → **Users & Permissions plugin** → **Roles** に移動
2. **Public** ロールをクリック
3. **日本情報記事** セクションで以下を有効化：
   - ✅ `find` (記事一覧取得)
   - ✅ `findOne` (単一記事取得)
4. **Save** をクリック

#### 1.3.2 認証済みユーザーアクセスの設定

1. **Authenticated** ロールをクリック
2. **日本情報記事** セクションで必要な権限を設定
3. **Save** をクリック

### 1.4 APIトークンの作成と管理

#### 1.4.1 APIトークンの生成

1. **Settings** → **Global settings** → **API Tokens** に移動
2. **Create new API Token** をクリック
3. 以下の情報を入力：

```
Name: IRUTOMO Integration Token
Description: IRUTOMOプロジェクトとの連携用APIトークン - 日本情報記事の読み取り専用
Token duration: 90 days (推奨) または Unlimited
Token type: Read-only (セキュリティ重視) または Custom
```

4. **Custom** を選択した場合、以下の権限のみを有効化：
   - **日本情報記事**: `find`, `findOne`

5. **Save** をクリック
6. 🚨 **重要**: 生成されたトークンを即座にコピーして安全な場所に保管

#### 1.4.2 APIトークンのセキュリティ設定

```bash
# .env.example に以下を追加（本番環境用）
STRAPI_API_TOKEN_SALT=your-random-salt-here
API_TOKEN_SALT=your-api-token-salt
```

### 1.5 CORS設定の調整

`config/middlewares.js` を確認し、CORS設定を調整：

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      header: '*',
      origin: ['http://localhost:3000', 'https://your-irutomo-domain.com']
    }
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

## 2. IRUTOMOプロジェクトの設定

### 2.1 環境変数の設定

#### 2.1.1 環境変数ファイルの作成

```bash
# .env.local (本番環境)
NEXT_PUBLIC_STRAPI_URL=https://strapi-production-dd77.up.railway.app
STRAPI_API_TOKEN=your-generated-api-token-here
STRAPI_TIMEOUT=10000
STRAPI_RETRY_ATTEMPTS=3

# .env.development (開発環境)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-dev-api-token-here
STRAPI_TIMEOUT=5000
STRAPI_RETRY_ATTEMPTS=2
```

#### 2.1.2 環境変数の検証

環境変数が正しく設定されているか確認するスクリプト：

```javascript
// lib/validate-env.js
export function validateEnvironment() {
  const requiredVars = {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
  };

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // URL形式の検証
  try {
    new URL(process.env.NEXT_PUBLIC_STRAPI_URL);
  } catch {
    throw new Error('NEXT_PUBLIC_STRAPI_URL must be a valid URL');
  }

  return true;
}
```

### 2.2 Strapi APIクライアントの実装

#### 2.2.1 APIクライアントの作成

```typescript
// lib/strapi.ts
import qs from 'qs';

interface StrapiConfig {
  url: string;
  token: string;
  timeout?: number;
  retryAttempts?: number;
}

class StrapiClient {
  private config: StrapiConfig;

  constructor(config: StrapiConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      ...config,
    };
  }

  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {},
    attempt = 1
  ): Promise<Response> {
    const url = `${this.config.url}/api${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.warn(`Request failed, retrying... (${attempt}/${this.config.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  async getJapanInfoArticles(query: any = {}) {
    const defaultQuery = {
      populate: {
        images: true,
        tags: true,
        embedLinks: true,
      },
      sort: ['createdAt:desc'],
      pagination: {
        page: 1,
        pageSize: 25,
      },
    };

    const mergedQuery = { ...defaultQuery, ...query };
    const queryString = qs.stringify(mergedQuery, { encodeValuesOnly: true });
    
    const response = await this.makeRequest(`/japan-info-articles?${queryString}`);
    return response.json();
  }

  async getJapanInfoArticle(id: string | number) {
    const query = qs.stringify({
      populate: '*',
    });

    const response = await this.makeRequest(`/japan-info-articles/${id}?${query}`);
    return response.json();
  }

  async getJapanInfoArticleBySlug(slug: string) {
    const query = qs.stringify({
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: '*',
    });

    const response = await this.makeRequest(`/japan-info-articles?${query}`);
    const data = await response.json();
    return data.data[0] || null;
  }
}

// シングルトンインスタンス
export const strapiClient = new StrapiClient({
  url: process.env.NEXT_PUBLIC_STRAPI_URL!,
  token: process.env.STRAPI_API_TOKEN!,
  timeout: parseInt(process.env.STRAPI_TIMEOUT || '10000'),
  retryAttempts: parseInt(process.env.STRAPI_RETRY_ATTEMPTS || '3'),
});
```

#### 2.2.2 TypeScript型定義

```typescript
// types/strapi.ts
export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface JapanInfoArticle {
  id: number;
  documentId: string;
  title: string;
  koreanTitle?: string;
  description: string;
  koreanDescription?: string;
  content: string;
  koreanContent?: string;
  imageUrl: string;
  images?: string[];
  tags?: string[];
  location?: string;
  isPopular: boolean;
  author?: string;
  views: number;
  embedLinks?: any[];
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

### 2.3 React Hooksの実装

```typescript
// hooks/useJapanInfo.ts
import { useState, useEffect } from 'react';
import { strapiClient } from '@/lib/strapi';
import { JapanInfoArticle, StrapiResponse } from '@/types/strapi';

export function useJapanInfoArticles(query: any = {}) {
  const [articles, setArticles] = useState<JapanInfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        
        const response: StrapiResponse<JapanInfoArticle[]> = 
          await strapiClient.getJapanInfoArticles(query);
        
        setArticles(response.data);
        setMeta(response.meta);
      } catch (err) {
        console.error('Failed to fetch Japan info articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [JSON.stringify(query)]);

  return { articles, loading, error, meta };
}

export function useJapanInfoArticle(slug: string) {
  const [article, setArticle] = useState<JapanInfoArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        
        const article = await strapiClient.getJapanInfoArticleBySlug(slug);
        setArticle(article);
        
        if (!article) {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Failed to fetch Japan info article:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  return { article, loading, error };
}
```

### 2.4 連携テストの実装

```typescript
// __tests__/strapi-integration.test.ts
import { strapiClient } from '@/lib/strapi';

describe('Strapi Integration', () => {
  test('should fetch Japan info articles', async () => {
    const response = await strapiClient.getJapanInfoArticles({
      pagination: { page: 1, pageSize: 5 }
    });
    
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('should handle API errors gracefully', async () => {
    // 無効なエンドポイントでテスト
    await expect(strapiClient.makeRequest('/invalid-endpoint'))
      .rejects.toThrow();
  });
});
```

## 3. 記事の作成と管理

### 3.1 記事作成のベストプラクティス

#### 3.1.1 記事作成フロー

1. **Content Manager** → **日本情報記事** → **Create new entry**
2. 必須フィールドの入力：
   ```
   title: 東京の桜の名所トップ10
   description: 東京都内で最も美しい桜を楽しめる場所をご紹介します
   content: [Rich Textエディタで詳細な記事内容を作成]
   imageUrl: https://example.com/sakura-main.jpg
   slug: 自動生成（tokyo-sakura-spots-top10）
   ```

3. **オプションフィールドの活用**：
   ```json
   {
     "tags": ["桜", "東京", "観光", "春"],
     "images": [
       "https://example.com/sakura1.jpg",
       "https://example.com/sakura2.jpg"
     ],
     "location": "東京都",
     "author": "IRUTOMO編集部",
     "embedLinks": [
       {
         "type": "youtube",
         "url": "https://youtube.com/watch?v=example",
         "title": "桜の映像"
       }
     ]
   }
   ```

4. **プレビューと公開**：
   - **Save** で下書き保存
   - プレビュー機能で確認
   - **Publish** で公開

#### 3.1.2 多言語コンテンツの管理

韓国語版を追加する場合：
```
koreanTitle: 도쿄 벚꽃 명소 톱 10
koreanDescription: 도쿄에서 가장 아름다운 벚꽃을 즐길 수 있는 장소를 소개합니다
koreanContent: [韓国語版の詳細内容]
```

### 3.2 コンテンツ最適化のガイドライン

#### 3.2.1 SEO最適化

- **title**: 60文字以内、キーワードを含める
- **description**: 160文字以内、記事の要約
- **slug**: URL-friendly、意味のある文字列
- **imageUrl**: alt属性に対応した説明的なファイル名

#### 3.2.2 パフォーマンス最適化

- 画像は WebP 形式を推奨
- 画像サイズは適切に最適化（1200x630px推奨）
- JSONフィールドは必要最小限のデータに制限

## 4. 高度なトラブルシューティング

### 4.1 接続問題の診断

#### 4.1.1 診断ツールの作成

```typescript
// utils/strapi-health-check.ts
export async function strapiHealthCheck() {
  const checks = {
    connection: false,
    authentication: false,
    apiAccess: false,
    dataIntegrity: false,
  };

  try {
    // 1. 基本接続テスト
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/health`);
    checks.connection = response.ok;

    // 2. 認証テスト
    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/japan-info-articles?pagination[limit]=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );
    checks.authentication = authResponse.ok;

    // 3. API アクセステスト
    if (checks.authentication) {
      const data = await authResponse.json();
      checks.apiAccess = Array.isArray(data.data);
      checks.dataIntegrity = data.data.length >= 0;
    }

  } catch (error) {
    console.error('Health check failed:', error);
  }

  return checks;
}
```

#### 4.1.2 エラーログの強化

```typescript
// utils/error-logger.ts
export class StrapiErrorLogger {
  static log(error: any, context: string) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      url: process.env.NEXT_PUBLIC_STRAPI_URL,
      token: process.env.STRAPI_API_TOKEN ? 'Present' : 'Missing',
    };

    console.error('Strapi Error:', errorInfo);
    
    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === 'production') {
      // Sentry、LogRocket、などに送信
    }
  }
}
```

### 4.2 パフォーマンス監視

#### 4.2.1 API レスポンス時間の監視

```typescript
// utils/performance-monitor.ts
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(operation: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      
      this.metrics.get(operation)!.push(duration);
      
      // 100回の履歴を保持
      if (this.metrics.get(operation)!.length > 100) {
        this.metrics.get(operation)!.shift();
      }
      
      return duration;
    };
  }

  static getMetrics(operation: string) {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return null;

    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { avg, min, max, count: times.length };
  }
}
```

### 4.3 セキュリティ強化

#### 4.3.1 APIトークンのローテーション

```bash
#!/bin/bash
# scripts/rotate-api-token.sh

echo "Rotating Strapi API Token..."

# 新しいトークンを生成（Strapi CLIまたはAPI経由）
NEW_TOKEN=$(strapi generate-token --name "IRUTOMO-$(date +%Y%m%d)")

# 環境変数を更新
sed -i "s/STRAPI_API_TOKEN=.*/STRAPI_API_TOKEN=$NEW_TOKEN/" .env

# デプロイメントの更新
railway variables:set STRAPI_API_TOKEN=$NEW_TOKEN

echo "Token rotation completed"
```

#### 4.3.2 レート制限の実装

```typescript
// middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15分
const MAX_REQUESTS = 100; // 15分間に100回まで

export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // 古いエントリをクリーンアップ
  const userRequests = requestCounts.get(ip) || [];
  const validRequests = userRequests.filter((time: number) => time > windowStart);

  if (validRequests.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  validRequests.push(now);
  requestCounts.set(ip, validRequests);

  return NextResponse.next();
}
```

## 5. デプロイメントとモニタリング

### 5.1 Railway デプロイメント設定

#### 5.1.1 環境変数の設定

```bash
# Railwayでの環境変数設定
railway variables:set NODE_ENV=production
railway variables:set STRAPI_API_TOKEN=your-production-token
railway variables:set DATABASE_URL=your-database-url
railway variables:set ADMIN_JWT_SECRET=your-admin-jwt-secret
railway variables:set APP_KEYS=your-app-keys
```

#### 5.1.2 デプロイメント監視

```typescript
// utils/deployment-monitor.ts
export async function deploymentHealthCheck() {
  const checks = [
    { name: 'Database', check: () => testDatabaseConnection() },
    { name: 'API', check: () => testAPIEndpoints() },
    { name: 'Admin', check: () => testAdminAccess() },
  ];

  const results = await Promise.allSettled(
    checks.map(async ({ name, check }) => ({
      name,
      status: await check() ? 'healthy' : 'unhealthy',
    }))
  );

  return results.map((result, index) => ({
    name: checks[index].name,
    status: result.status === 'fulfilled' ? result.value.status : 'error',
  }));
}
```

### 5.2 継続的なメンテナンス

#### 5.2.1 定期バックアップ

```bash
#!/bin/bash
# scripts/backup-content.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# コンテンツのエクスポート
strapi export --file "$BACKUP_DIR/content_$DATE.tar.gz" --only content

# データベースのバックアップ
pg_dump $DATABASE_URL > "$BACKUP_DIR/database_$DATE.sql"

echo "Backup completed: $DATE"
```

#### 5.2.2 パフォーマンス最適化

```javascript
// config/database.js - 本番環境用設定
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false) && {
        key: env('DATABASE_SSL_KEY', undefined),
        cert: env('DATABASE_SSL_CERT', undefined),
        ca: env('DATABASE_SSL_CA', undefined),
        capath: env('DATABASE_SSL_CAPATH', undefined),
        cipher: env('DATABASE_SSL_CIPHER', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
      acquireTimeoutMillis: env.int('DATABASE_POOL_ACQUIRE_TIMEOUT', 60000),
      createTimeoutMillis: env.int('DATABASE_POOL_CREATE_TIMEOUT', 30000),
      destroyTimeoutMillis: env.int('DATABASE_POOL_DESTROY_TIMEOUT', 5000),
      idleTimeoutMillis: env.int('DATABASE_POOL_IDLE_TIMEOUT', 30000),
      reapIntervalMillis: env.int('DATABASE_POOL_REAP_INTERVAL', 1000),
      createRetryIntervalMillis: env.int('DATABASE_POOL_CREATE_RETRY_INTERVAL', 200),
    },
    debug: false,
  },
});
```

## 6. 参考リンク・リソース

### 6.1 公式ドキュメント
- [Strapi v5 公式ドキュメント](https://docs.strapi.io)
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Railway 公式ドキュメント](https://docs.railway.app)

### 6.2 開発者リソース
- [Strapi Community Forum](https://forum.strapi.io)
- [Strapi Discord](https://discord.strapi.io)
- [GitHub - Strapi](https://github.com/strapi/strapi)

### 6.3 セキュリティガイド
- [Strapi Security Guide](https://docs.strapi.io/dev-docs/configurations/security)
- [API Token Security Best Practices](https://docs.strapi.io/user-docs/settings/API-tokens)

### 6.4 パフォーマンス最適化
- [Strapi Performance Guide](https://docs.strapi.io/dev-docs/backend-customization/examples/performance)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**最終更新**: 2024年12月
**対応バージョン**: Strapi v5.0.x, Next.js 14.x, Node.js 18.x+ 