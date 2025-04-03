"use client";

import React from 'react';

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

/**
 * インタラクティブなタブボタンコンポーネント
 * Client Componentとして実装
 */
export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium border-b-2 transition-colors ${
        active 
          ? 'border-orange-500 text-orange-500' 
          : 'border-transparent text-gray-600 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  );
} 