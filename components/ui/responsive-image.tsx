'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface ResponsiveImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  mobileSrc?: string;
  desktopSrc?: string;
  breakpoint?: number;
}

export function ResponsiveImage({
  src,
  mobileSrc,
  desktopSrc,
  breakpoint = 768,
  ...props
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // モバイルとデスクトップで異なる画像を使用する場合
    if (mobileSrc || desktopSrc) {
      const handleResize = () => {
        const isDesktop = window.innerWidth >= breakpoint;
        if (isDesktop && desktopSrc) {
          setCurrentSrc(desktopSrc);
        } else if (!isDesktop && mobileSrc) {
          setCurrentSrc(mobileSrc);
        } else {
          setCurrentSrc(src);
        }
      };
      
      // 初期設定
      handleResize();
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [src, mobileSrc, desktopSrc, breakpoint]);

  if (!isMounted) {
    // SSRでの初期表示用
    return <Image src={src} {...props} />;
  }

  return <Image src={currentSrc} {...props} />;
}

// 使用例:
// <ResponsiveImage
//   src="/default-image.jpg"
//   mobileSrc="/mobile-image.jpg"
//   desktopSrc="/desktop-image.jpg"
//   width={500}
//   height={300}
//   alt="レスポンシブ画像"
//   className="rounded-lg"
// /> 