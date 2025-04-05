'use client';

import Link from 'next/link';
import Image from 'next/image';

export function KoreanFoodHero() {
  return (
    <div className="px-4 pt-6 pb-4 sm:px-6 md:px-8 md:py-12">
      <div className="hero-banner bg-gradient-to-r from-[#F8AD3D] via-[#D6C571] to-[#53C1A6] rounded-2xl p-6 md:p-12 text-white shadow-sm md:flex md:items-center md:justify-between">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-3 leading-relaxed md:text-3xl lg:text-4xl">
            現地日本人から<br />
            人気の食堂を<br />
            簡単予約 🍽️
          </h2>
          <p className="text-sm opacity-90 mb-4 md:text-base lg:text-lg md:mb-6">電話予約のみの人気店も私たちにお任せください！</p>
          
          <Link href="/restaurants" className="inline-block bg-white text-[#FFA500] font-medium px-4 py-2 rounded-full text-sm shadow-sm hover:bg-opacity-90 transition-colors md:px-6 md:py-3 md:text-base">
            予約する
          </Link>
        </div>
        
        <div className="hidden md:block md:w-1/2 md:pl-8">
          <div className="relative w-full h-64 lg:h-80">
            <Image 
              src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800" 
              alt="韓国料理" 
              fill 
              className="object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 