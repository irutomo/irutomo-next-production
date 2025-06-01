// ===================================
// Apple風ローディングスピナーコンポーネント
// ===================================

import { SparklesIcon } from 'lucide-react';

export function AppleLoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent absolute top-0 left-0"></div>
        <SparklesIcon className="w-6 h-6 text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
    </div>
  );
} 