"use client";

import { useState } from 'react';
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

export function RestaurantImageSlider({ images, alt }: RestaurantImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imagesArray.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === imagesArray.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div className="h-48 w-full">
        <Image 
          src={imagesArray[currentImageIndex]}
          alt={`${alt} - 画像 ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw"
          priority={currentImageIndex === 0}
        />
      </div>

      {/* 前へボタン */}
      {imagesArray.length > 1 && (
        <button
          onClick={goToPrevImage}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors"
          aria-label="前の画像へ"
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