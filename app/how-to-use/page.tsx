'use client';

import HowToUseContent from './how-to-use-content';
import { useEffect } from 'react';

export default function HowToUsePage() {
  // グローバルヘッダーを非表示にする
  useEffect(() => {
    const header = document.querySelector('.global-header');
    if (header) {
      header.classList.add('hidden');
    }

    return () => {
      const header = document.querySelector('.global-header');
      if (header) {
        header.classList.remove('hidden');
      }
    };
  }, []);

  return <HowToUseContent />;
} 