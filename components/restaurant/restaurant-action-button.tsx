"use client";

import React from 'react';
import Link from 'next/link';

type RestaurantActionButtonProps = {
  restaurantId: string;
  label?: string;
};

/**
 * レストラン用アクションボタン
 * Client Componentとして実装
 */
export function RestaurantActionButton({ 
  restaurantId, 
  label = '選択' 
}: RestaurantActionButtonProps) {
  return (
    <Link
      href={`/restaurants/${restaurantId}`}
      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
    >
      {label}
    </Link>
  );
} 