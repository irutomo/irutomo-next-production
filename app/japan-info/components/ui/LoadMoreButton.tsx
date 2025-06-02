// ===================================
// もっと読むボタンコンポーネント  
// ===================================

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function LoadMoreButton({ 
  onClick, 
  loading = false, 
  disabled = false,
  children = "もっと読む"
}: LoadMoreButtonProps) {
  return (
    <div className="text-center py-8">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          px-8 py-4 rounded-full text-lg font-medium transition-all duration-200
          ${loading || disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-accent text-white hover:bg-accent/90 hover:scale-105 active:scale-95'
          }
        `}
      >
        {loading ? '読み込み中...' : children}
      </button>
    </div>
  );
}

// Backward compatibility
export { LoadMoreButton as AppleLoadMoreButton }; 