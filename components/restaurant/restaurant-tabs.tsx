"use client";

import React, { useState } from 'react';
import { TabButton } from './tab-button';

type RestaurantTabsProps = {
  restaurantData: {
    description: string;
    business_hours: {
      day: string;
      open_time?: string;
      close_time?: string;
      is_closed?: boolean;
      formattedHours?: string;
    }[];
    menu_items: {
      id: string;
      name: string;
      description?: string;
      price: number;
      image?: string;
    }[];
  };
};

export function RestaurantTabs({ restaurantData }: RestaurantTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');

  // 営業時間のフォーマット
  const formattedHours = restaurantData.business_hours || [];

  return (
    <>
      {/* タブナビゲーション */}
      <div className="border-b mb-6">
        <div className="flex overflow-x-auto hide-scrollbar">
          <TabButton 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            店舗情報
          </TabButton>
          <TabButton 
            active={activeTab === 'menu'} 
            onClick={() => setActiveTab('menu')}
          >
            メニュー
          </TabButton>
          <TabButton 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            レビュー
          </TabButton>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="space-y-6">
        {/* 店舗情報タブ */}
        {activeTab === 'info' && (
          <>
            {/* 紹介文 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">紹介</h2>
              <p className="text-gray-700 whitespace-pre-line">{restaurantData.description}</p>
            </div>

            {/* 営業時間 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">営業時間</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {formattedHours.map((hour, index) => (
                      <tr 
                        key={hour.day} 
                        className={index % 2 === 0 ? 'bg-gray-50' : ''}
                      >
                        <td className="py-3 px-4 border-b">{hour.day}</td>
                        <td className={`py-3 px-4 border-b ${
                          hour.formattedHours === '定休日' ? 'text-red-500' : ''
                        }`}>
                          {hour.formattedHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* メニュータブ */}
        {activeTab === 'menu' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">メニュー</h2>
            {restaurantData.menu_items && restaurantData.menu_items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurantData.menu_items.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    <p className="font-medium text-blue-800">¥{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">メニュー情報がありません。</p>
            )}
          </div>
        )}

        {/* レビュータブ */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">レビュー</h2>
            <p className="text-gray-500">現在、レビューはありません。</p>
          </div>
        )}
      </div>
    </>
  );
} 