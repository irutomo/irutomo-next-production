'use client';

import { useBreakpoint, useResponsiveValue } from '@/hooks/use-media-query';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';

export default function ResponsiveExamplePage() {
  // ブレークポイントのチェック
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  
  // ブレークポイントに応じた値の取得
  const fontSize = useResponsiveValue({
    base: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  });
  
  // グリッドアイテム数の設定
  const columns = useResponsiveValue({
    base: 2,
    md: 3,
    lg: 4
  });
  
  return (
    <div className="container-responsive section-spacing">
      <h1 className="mb-8">レスポンシブデザインの例</h1>
      
      {/* 基本的なTailwindレスポンシブ対応 */}
      <section className="card-responsive mb-8">
        <h2 className="mb-4">1. Tailwindのブレークポイント</h2>
        <div className="p-4 bg-gray-100 rounded-lg mb-4">
          <p className="text-sm md:text-base lg:text-lg">
            これはTailwindのブレークポイントを使用したテキストです。
            画面サイズを変更すると、テキストサイズが変わります。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="bg-blue-100 p-4 rounded-lg">
              アイテム {item}
            </div>
          ))}
        </div>
      </section>
      
      {/* カスタムフックを使ったレスポンシブ対応 */}
      <section className="card-responsive mb-8">
        <h2 className="mb-4">2. useBreakpointフック</h2>
        <div className="p-4 bg-gray-100 rounded-lg">
          <p>現在の画面サイズ:</p>
          <p className={fontSize}>
            {isLg ? '大画面 (1024px以上)' : isMd ? '中画面 (768px-1023px)' : '小画面 (768px未満)'}
          </p>
        </div>
      </section>
      
      {/* レスポンシブグリッド */}
      <section className="card-responsive mb-8">
        <h2 className="mb-4">3. 動的グリッド ({columns}列)</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-green-100 p-4 rounded-lg text-center">
              {i + 1}
            </div>
          ))}
        </div>
      </section>
      
      {/* ResponsiveWrapper コンポーネント */}
      <section className="card-responsive mb-8">
        <h2 className="mb-4">4. ResponsiveWrapperコンポーネント</h2>
        <ResponsiveWrapper
          mobileContent={
            <div className="bg-red-100 p-4 rounded-lg">
              モバイル用表示コンテンツ
            </div>
          }
          desktopContent={
            <div className="bg-blue-100 p-4 rounded-lg">
              デスクトップ用表示コンテンツ
            </div>
          }
        />
      </section>
      
      {/* ResponsiveImage コンポーネント */}
      <section className="card-responsive">
        <h2 className="mb-4">5. ResponsiveImageコンポーネント</h2>
        <div className="overflow-hidden rounded-lg">
          <ResponsiveImage
            src="/fallback-image.jpg"
            mobileSrc="/mobile-image.jpg"
            desktopSrc="/desktop-image.jpg"
            width={800}
            height={400}
            alt="レスポンシブ画像の例"
            className="w-full h-auto"
          />
        </div>
        <p className="text-center text-gray-500 mt-2">
          注: 実際の画像は用意されていないため、画像は表示されません
        </p>
      </section>
    </div>
  );
} 