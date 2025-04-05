'use client';

import Image from 'next/image';
import Link from 'next/link';

export function PopularRestaurants() {
  const restaurants = [
    {
      id: 1,
      name: '明洞カルグクス',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400',
      rating: 4.8,
      area: '明洞',
      tags: ['韓国料理', 'カルグクス']
    },
    {
      id: 2,
      name: '土俗村参鶏湯',
      image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=400',
      rating: 4.9,
      area: '鐘路3街',
      tags: ['参鶏湯', '韓国料理']
    }
  ];

  return (
    <div className="px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">人気店舗</h2>
        <Link href="/restaurants" className="text-sm text-[#00CBB3]">
          もっと見る &gt;
        </Link>
      </div>
      
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <Link href={`/restaurants/${restaurant.id}`} key={restaurant.id} className="block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-48">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold">
                  ★ {restaurant.rating}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">{restaurant.name}</h3>
                  <div className="text-sm text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {restaurant.area}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {restaurant.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-[rgba(0,203,179,0.1)] text-[#00CBB3] px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 