'use client';

import { useEffect, useState } from 'react';

interface ResponsiveWrapperProps {
  mobileContent: React.ReactNode;
  desktopContent: React.ReactNode;
  breakpoint?: number;
}

export function ResponsiveWrapper({ 
  mobileContent, 
  desktopContent, 
  breakpoint = 768 
}: ResponsiveWrapperProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // 初期設定
    setIsMobile(window.innerWidth < breakpoint);

    // リサイズ検知
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return (
    <>
      {isMobile ? mobileContent : desktopContent}
    </>
  );
}

// 使用例:
// <ResponsiveWrapper
//   mobileContent={<モバイル向けコンポーネント />}
//   desktopContent={<デスクトップ向けコンポーネント />}
//   breakpoint={768} // デフォルトは768px
// /> 