"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface RestaurantImageSliderProps {
  images: string[] | string;
  alt: string;
}

// 有効なURLかどうかをチェックする関数
function isValidImageUrl(url: string): boolean {
  // 空文字列やnull/undefinedはfalseを返す
  if (!url) return false;
  
  // 相対パスの場合は有効と見なす
  if (url.startsWith('/')) return true;
  
  // URLオブジェクトでの検証を試みる
  try {
    new URL(url);
    return true;
  } catch (e) {
    // URLの構築に失敗した場合は無効
    return false;
  }
}

// 画像のプリロード用の関数
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`画像の読み込みに失敗しました: ${src}`));
  });
}

export function RestaurantImageSlider({ images, alt }: RestaurantImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<number[]>([0]); // 最初の画像は優先読み込み
  const placeholderImage = '/images/restaurants/placeholder.jpg';

  // 画像が存在しない場合またはimagesが配列でない場合の処理
  let imagesArray: string[] = [];
  
  if (Array.isArray(images)) {
    // 配列の場合は有効なURLのみをフィルタリング
    imagesArray = images.filter(img => isValidImageUrl(img));
  } else if (typeof images === 'string' && isValidImageUrl(images)) {
    // 文字列で有効なURLの場合は配列に変換
    imagesArray = [images];
  }
  
  // 配列が空の場合はプレースホルダーを使用
  if (!imagesArray.length) {
    imagesArray = [placeholderImage];
  }

  // 画像のプリロード
  useEffect(() => {
    const preloadNextImage = async () => {
      // 現在の画像のインデックスを取得
      const nextIndex = (currentImageIndex + 1) % imagesArray.length;
      const prevIndex = currentImageIndex === 0 ? imagesArray.length - 1 : currentImageIndex - 1;
      
      // 読み込み済みでない場合のみプリロード
      if (!loadedImages.includes(nextIndex)) {
        try {
          setIsLoading(true);
          await preloadImage(imagesArray[nextIndex]);
          setLoadedImages(prev => [...prev, nextIndex]);
        } catch (error) {
          console.error('画像のプリロードに失敗:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      // 前の画像もプリロード
      if (!loadedImages.includes(prevIndex)) {
        try {
          await preloadImage(imagesArray[prevIndex]);
          setLoadedImages(prev => [...prev, prevIndex]);
        } catch (error) {
          console.error('画像のプリロードに失敗:', error);
        }
      }
    };
    
    preloadNextImage();
  }, [currentImageIndex, imagesArray, loadedImages]);

  // 初期画像の読み込み完了時
  useEffect(() => {
    if (loadedImages.includes(currentImageIndex)) {
      setIsLoading(false);
    }
  }, [loadedImages, currentImageIndex]);

  const goToPrevImage = () => {
    setIsLoading(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? imagesArray.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setIsLoading(true);
    setCurrentImageIndex((prev) => 
      prev === imagesArray.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    if (index !== currentImageIndex) {
      setIsLoading(true);
      setCurrentImageIndex(index);
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div className="h-48 w-full relative">
        {/* メイン画像 */}
        <Image 
          src={imagesArray[currentImageIndex]}
          alt={`${alt} - 画像 ${currentImageIndex + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading && !loadedImages.includes(currentImageIndex) ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={currentImageIndex === 0}
          onLoad={() => {
            setIsLoading(false);
            setLoadedImages(prev => [...prev, currentImageIndex]);
          }}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjBmMGYwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZTBlMGUwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg=="
        />

        {/* ローディングインジケーター */}
        {isLoading && !loadedImages.includes(currentImageIndex) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00CBB3] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">読み込み中...</span>
            </div>
          </div>
        )}
      </div>

      {/* 前へボタン */}
      {imagesArray.length > 1 && (
        <button
          onClick={goToPrevImage}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors"
          aria-label="前の画像へ"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}

      {/* 次へボタン */}
      {imagesArray.length > 1 && (
        <button
          onClick={goToNextImage}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors"
          aria-label="次の画像へ"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}

      {/* インジケーター */}
      {imagesArray.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {imagesArray.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`画像 ${index + 1} へ`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 