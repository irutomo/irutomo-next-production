'use client';

// ===================================
// 記事共有ボタンコンポーネント
// ===================================

import React, { useState } from 'react';
import { Link, Check, Instagram } from 'lucide-react';
import { LanguageKey } from '../../lib/translations';
import { getFontClass } from '../../lib/utils';

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  language: LanguageKey;
}

interface ShareOption {
  id: string;
  label: string;
  labelKo: string;
  icon: React.ReactNode;
  color: string;
  action: (title: string, url: string) => void;
}

export function ArticleShareButtons({ title, url, language }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fontClass = getFontClass(language);

  // URLをクリップボードにコピー
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // フォールバック: 従来の方法
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // 最終フォールバック
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (execError) {
        console.error('Fallback copy failed:', execError);
      }
      document.body.removeChild(textArea);
    }
  };

  // Instagram共有（モバイル対応）
  const shareOnInstagram = (title: string, url: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const textToCopy = `${title}\n${url}`;
    
    if (isMobile) {
      // モバイルの場合はInstagramアプリを開こうとする
      const instagramUrl = 'instagram://camera';
      
      // フォールバック用にテキストをクリップボードにコピー
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).catch(() => {
          console.log('クリップボードへのコピーに失敗しました');
        });
      }
      
      // Instagramアプリを開く（インストールされていない場合はブラウザでInstagramを開く）
      window.open(instagramUrl, '_blank');
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1000);
    } else {
      // デスクトップの場合はクリップボードにコピーしてInstagramを開く
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          alert(language === 'ja' 
            ? 'テキストがコピーされました。Instagramに投稿してください！' 
            : '텍스트가 복사되었습니다. Instagram에 게시해주세요!'
          );
          window.open('https://www.instagram.com/', '_blank');
        }).catch(() => {
          window.open('https://www.instagram.com/', '_blank');
        });
      } else {
        // フォールバック処理
        try {
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          alert(language === 'ja' 
            ? 'テキストがコピーされました。Instagramに投稿してください！' 
            : '텍스트가 복사되었습니다. Instagram에 게시해주세요!'
          );
        } catch (error) {
          console.error('Copy fallback failed:', error);
        }
        window.open('https://www.instagram.com/', '_blank');
      }
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      label: 'URLをコピー',
      labelKo: 'URL 복사',
      icon: copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />,
      color: copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      action: copyToClipboard
    },
    {
      id: 'instagram',
      label: 'Instagram',
      labelKo: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
      action: shareOnInstagram
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className={`text-lg font-bold text-gray-900 mb-4 text-center ${fontClass}`}>
        {language === 'ja' ? 'この記事をシェア🔗' : '이 기사 공유하기🔗'}
      </h3>
      
      <div className="flex flex-wrap justify-center gap-3">
        {shareOptions.map((option) => {
          const label = language === 'ja' ? option.label : option.labelKo;
          
          return (
            <button
              key={option.id}
              onClick={() => option.action(title, url)}
              className={`
                flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${option.color}
                hover:scale-105 active:scale-95
                min-w-[100px] justify-center
              `}
              aria-label={label}
            >
              <span className="mr-2">{option.icon}</span>
              <span className={`text-sm ${fontClass}`}>{label}</span>
            </button>
          );
        })}
      </div>
      
      <p className={`text-center text-sm text-gray-500 mt-4 ${fontClass}`}>
        {language === 'ja' 
          ? '記事を友達に教えて、一緒に日本の魅力を発見しましょう！'
          : '친구들과 함께 일본의 매력을 발견해보세요!'
        }
      </p>
    </div>
  );
} 