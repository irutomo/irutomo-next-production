'use client';

import Link from 'next/link';

export function ServiceFeatures() {
  const features = [
    {
      icon: 'phone',
      title: '電話予約代行',
      description: '日本語が通じない人気店も予約可能',
      color: 'orange',
      href: '/service#phone-reservation'
    },
    {
      icon: 'calendar',
      title: '簡単予約',
      description: '24時間いつでも予約リクエスト可能',
      color: 'teal',
      href: '/reservation'
    },
    {
      icon: 'clock',
      title: '迅速な対応',
      description: '予約確定後すぐにご連絡いたします',
      color: 'teal',
      href: '/service#fast-response'
    }
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {features.map((feature, index) => (
        <Link 
          key={index}
          href={feature.href}
          className="block"
        >
          <div 
            className={`bg-white/50 rounded-2xl p-4 shadow-sm border-2 ${
              feature.color === 'orange' ? 'border-[#FFA500]' : 'border-[#00CBB3]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`
                text-2xl ${feature.color === 'orange' ? 'text-[#FFA500]' : 'text-[#00CBB3]'}
              `}>
                {feature.icon === 'phone' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
                {feature.icon === 'calendar' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {feature.icon === 'clock' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 