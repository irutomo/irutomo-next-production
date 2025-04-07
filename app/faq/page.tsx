'use client';

import FaqContent from './faq-content';
import { useEffect } from 'react';

export default function FaqPage() {
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

  return <FaqContent />;
} 