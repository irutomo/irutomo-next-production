import { JapanInfo } from '@/types/japan-info';

// Strapi API URL
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi-production-dd77.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

/**
 * 基本的なfetch関数
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN ? { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, mergedOptions);
  
  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch data from API: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Strapi APIからのレスポンスの構造
 */
interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * 単一アイテムのStrapiレスポンス
 */
interface StrapiSingleResponse<T> {
  data: {
    id: number;
    attributes: T;
  };
  meta: {};
}

/**
 * Strapiの埋め込みリンクの構造
 */
interface StrapiEmbedLinks {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

/**
 * Strapiの日本情報記事の構造
 */
interface StrapiJapanInfoArticle {
  title: string;
  koreanTitle: string;
  description: string;
  koreanDescription: string;
  content: string;
  koreanContent: string;
  imageUrl: string;
  images?: string[];
  tags: string[];
  location: string;
  isPopular: boolean;
  publishedAt: string;
  updatedAt: string;
  author?: string;
  views?: number;
  embedLinks?: StrapiEmbedLinks;
  slug: string;
}

/**
 * Strapi形式から内部形式へマッピング
 */
function mapStrapiJapanInfoToInternal(strapiItem: { id: number; attributes: StrapiJapanInfoArticle }): JapanInfo {
  const { id, attributes } = strapiItem;
  
  return {
    id: id.toString(),
    title: attributes.title,
    korean_title: attributes.koreanTitle,
    description: attributes.description,
    korean_description: attributes.koreanDescription,
    content: attributes.content,
    korean_content: attributes.koreanContent,
    image_url: attributes.imageUrl,
    images: attributes.images || [],
    tags: attributes.tags || [],
    location: attributes.location,
    is_popular: attributes.isPopular,
    published_at: attributes.publishedAt,
    updated_at: attributes.updatedAt,
    author: attributes.author,
    views: attributes.views,
    embed_links: attributes.embedLinks,
    slug: attributes.slug,
  };
}

/**
 * すべての日本情報記事を取得
 */
export async function getAllJapanInfoArticles(): Promise<JapanInfo[]> {
  try {
    const response = await fetchAPI<StrapiResponse<StrapiJapanInfoArticle>>('/japan-info-articles?populate=*');
    return response.data.map(mapStrapiJapanInfoToInternal);
  } catch (error) {
    console.error('Error fetching Japan info articles from Strapi:', error);
    return [];
  }
}

/**
 * 人気の日本情報記事を取得
 */
export async function getPopularJapanInfoArticles(): Promise<JapanInfo[]> {
  try {
    const response = await fetchAPI<StrapiResponse<StrapiJapanInfoArticle>>(
      '/japan-info-articles?populate=*&filters[isPopular][$eq]=true'
    );
    return response.data.map(mapStrapiJapanInfoToInternal);
  } catch (error) {
    console.error('Error fetching popular Japan info articles from Strapi:', error);
    return [];
  }
}

/**
 * IDで日本情報記事を取得
 */
export async function getJapanInfoArticleById(id: string): Promise<JapanInfo | null> {
  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiJapanInfoArticle>>(
      `/japan-info-articles/${id}?populate=*`
    );
    return mapStrapiJapanInfoToInternal(response.data);
  } catch (error) {
    console.error(`Error fetching Japan info article with ID ${id} from Strapi:`, error);
    return null;
  }
}

/**
 * スラッグで日本情報記事を取得
 */
export async function getJapanInfoArticleBySlug(slug: string): Promise<JapanInfo | null> {
  try {
    const response = await fetchAPI<StrapiResponse<StrapiJapanInfoArticle>>(
      `/japan-info-articles?filters[slug][$eq]=${slug}&populate=*`
    );
    
    if (response.data.length === 0) {
      return null;
    }
    
    return mapStrapiJapanInfoToInternal(response.data[0]);
  } catch (error) {
    console.error(`Error fetching Japan info article with slug ${slug} from Strapi:`, error);
    return null;
  }
}

/**
 * タグでフィルタリングされた日本情報記事を取得
 */
export async function getJapanInfoArticlesByTag(tag: string): Promise<JapanInfo[]> {
  try {
    const response = await fetchAPI<StrapiResponse<StrapiJapanInfoArticle>>(
      `/japan-info-articles?filters[tags][$contains]=${tag}&populate=*`
    );
    return response.data.map(mapStrapiJapanInfoToInternal);
  } catch (error) {
    console.error(`Error fetching Japan info articles with tag ${tag} from Strapi:`, error);
    return [];
  }
}

/**
 * 記事の閲覧数を更新
 */
export async function updateJapanInfoArticleViews(id: string): Promise<void> {
  try {
    // まず現在の記事を取得して閲覧数を確認
    const article = await getJapanInfoArticleById(id);
    if (!article) return;
    
    // 閲覧数を増やす
    const updatedViews = (article.views || 0) + 1;
    
    // 更新リクエストを送信
    await fetchAPI(`/japan-info-articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          views: updatedViews,
        },
      }),
    });
  } catch (error) {
    console.error(`Error updating views for Japan info article with ID ${id}:`, error);
  }
} 