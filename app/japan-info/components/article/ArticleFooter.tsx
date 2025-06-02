'use client';

// ===================================
// 記事フッター統合コンポーネント
// ===================================

import { useEffect, useState } from 'react';
import { JapanInfo } from '@/types/japan-info';
import { LanguageKey } from '../../lib/translations';
import { getArticleTitle } from '../../lib/utils';
import { ArticleReactions } from './ArticleReactions';
import { ArticleShareButtons } from './ArticleShareButtons';
import { RelatedArticles } from './RelatedArticles';

interface ArticleFooterProps {
  article: JapanInfo;
  relatedArticles: JapanInfo[];
  language: LanguageKey;
}

export function ArticleFooter({ article, relatedArticles, language }: ArticleFooterProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const title = getArticleTitle(article, language);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="space-y-8">
      {/* 反応スタンプ */}
      <ArticleReactions 
        articleId={article.id}
        language={language}
      />

      {/* 共有ボタン */}
      <ArticleShareButtons 
        title={title}
        url={currentUrl}
        language={language}
      />

      {/* 関連記事 */}
      <RelatedArticles 
        articles={relatedArticles}
        currentArticleId={article.id}
        language={language}
      />
    </div>
  );
} 