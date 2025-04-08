'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

type BackHeaderProps = {
  title: string;
  backUrl?: string;
};

export function BackHeader({ title, backUrl = '/' }: BackHeaderProps) {
  return (
    <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
      <Link href={backUrl} className="text-gray-600 mr-4">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold text-[#FFA500]">{title}</h1>
      <div className="ml-auto flex items-center">
        <LanguageSwitcher />
      </div>
    </header>
  );
} 