// ===================================
// 空状態表示コンポーネント
// ===================================

import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({ 
  message = "記事が見つかりませんでした",
  description = "検索条件を変更してもう一度お試しください"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );
}

// Backward compatibility
export { EmptyState as AppleEmptyState }; 