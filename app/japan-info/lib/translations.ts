// ===================================
// Japan Info 多言語対応翻訳データ
// メインページと詳細ページで共通利用
// ===================================

export const japanInfoTranslations = {
  ja: {
    // ページタイトル・基本情報
    pageTitle: '日本MZ情報🍯',
    pageDescription: '日本のMZ世代トレンド・カルチャー・ライフスタイル情報をお届け!!',
    japanInfo: '日本情報',
    
    // アクション・ナビゲーション
    readMore: '続きを読む',
    loadMore: 'もっと記事を見る',
    backToList: '日本情報一覧に戻る',
    
    // 日付・時間
    noDate: '日付不明',
    publishedAt: '公開日',
    readingTime: '5分で読める',
    
    // 記事情報
    totalArticles: '全{{count}}件の記事',
    noArticles: '記事がありません',
    articleNotFound: '記事が見つかりません',
    noContent: 'コンテンツがありません。',
    
    // メッセージ
    comingSoon: '近日中に新しい記事を更新予定です。',
    newInfoDelivery: '新着情報をお届け',
    articleNotFoundDescription: 'ID「{{id}}」に該当する記事が存在しません。',
    
    // メタ情報
    author: '著者',
    tags: 'タグ',
    location: '場所',
    views: '閲覧数',
    
    // 言語切り替え
    viewInKorean: '한국어로 보기',
  },
  ko: {
    // ページタイトル・基本情報
    pageTitle: '일본 MZ 정보🍯',
    pageDescription: '일본 MZ세대의 트렌드, 문화, 라이프스타일 정보를 전달합니다!!',
    japanInfo: '일본정보',
    
    // アクション・ナビゲーション
    readMore: '더 보기',
    loadMore: '더 많은 기사 보기',
    backToList: '일본정보 일람에 돌아가기',
    
    // 日付・時間
    noDate: '날짜 미정',
    publishedAt: '게시일',
    readingTime: '5분 읽기',
    
    // 記事情報
    totalArticles: '총 {{count}}개의 기사',
    noArticles: '기사가 없습니다',
    articleNotFound: '기사를 찾을 수 없습니다',
    noContent: '콘텐츠가 없습니다.',
    
    // メッセージ
    comingSoon: '곧 새로운 기사를 업데이트할 예정입니다.',
    newInfoDelivery: '당신만의 일본여행',
    articleNotFoundDescription: 'ID "{{id}}"에 해당하는 기사가 존재하지 않습니다.',
    
    // メタ情報
    author: '작성자',
    tags: '태그',
    location: '위치',
    views: '조회수',
    
    // 言語切り替え
    viewInJapanese: '日本語で見る',
  }
} as const;

export type LanguageKey = 'ja' | 'ko';

// ヘルパー関数
export function getTranslation(
  language: LanguageKey, 
  key: string, 
  replacements?: Record<string, string>
): string {
  const translations = japanInfoTranslations[language] as Record<string, string>;
  let text = translations[key] || key;
  
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{{${placeholder}}}`, value);
    });
  }
  
  return text;
} 