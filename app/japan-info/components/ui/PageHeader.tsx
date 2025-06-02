// ===================================
// ページヘッダーコンポーネント
// ===================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="mb-6">
        <span className="text-6xl">✈️</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {title}
      </h1>
      
      {subtitle && (
        <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
          {subtitle}
        </h2>
      )}
      
      {description && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// Backward compatibility
export { PageHeader as ApplePageHeader }; 