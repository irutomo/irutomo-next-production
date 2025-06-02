// ===================================
// Japan Info Components Index
// ===================================

// UI Components (Reusable UI elements)
export { LoadingSpinner } from './ui/LoadingSpinner';
export { EmptyState } from './ui/EmptyState';
export { LoadMoreButton } from './ui/LoadMoreButton';
export { PageHeader } from './ui/PageHeader';
export { default as ErrorBoundary } from './ui/ErrorBoundary';

// Article Components (Article-specific features)
export { ArticleCard } from './article/ArticleCard';
export { ArticleDetailHeader } from './article/ArticleDetailHeader';
export { ArticleReactions } from './article/ArticleReactions';
export { ArticleShareButtons } from './article/ArticleShareButtons';
export { ArticleFooter } from './article/ArticleFooter';
export { TableOfContents } from './article/TableOfContents';
export { RelatedArticles } from './article/RelatedArticles';

// Shared Components (Japan Info feature-wide)
export { JapanInfoClient } from './shared/JapanInfoClient';
export { ArticleNavigation } from './shared/ArticleNavigation';

// Legacy exports for backward compatibility
export { LoadingSpinner as AppleLoadingSpinner } from './ui/LoadingSpinner';
export { EmptyState as AppleEmptyState } from './ui/EmptyState';
export { LoadMoreButton as AppleLoadMoreButton } from './ui/LoadMoreButton';
export { PageHeader as ApplePageHeader } from './ui/PageHeader';
export { ArticleCard as AppleArticleCard } from './article/ArticleCard'; 