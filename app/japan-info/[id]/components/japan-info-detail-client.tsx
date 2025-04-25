'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JapanInfo } from '@/types/japan-info';
import { ArrowLeft, MapPinIcon, TagIcon, EyeIcon, LinkIcon } from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast'; // 通知用

// Kakao SDK の型を一時的に any として定義
declare global {
  interface Window {
    Kakao: any;
  }
}

interface JapanInfoDetailClientProps {
  info: JapanInfo;
  language: 'ja' | 'ko';
}

export default function JapanInfoDetailClient({ info, language }: JapanInfoDetailClientProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const [isKakaoSdkReady, setIsKakaoSdkReady] = useState(false);
  const [localViews, setLocalViews] = useState<number | undefined>(info.views);

  useEffect(() => {
    // クライアントサイドでのみ window オブジェクトにアクセス
    setCurrentUrl(window.location.href);
    setShareText(language === 'ko' ? info.korean_title || info.title : info.title);

    // Kakao SDKの準備状況を確認
    if (window.Kakao && window.Kakao.isInitialized()) {
      setIsKakaoSdkReady(true);
    } else {
      const timer = setTimeout(() => {
        if (window.Kakao && window.Kakao.isInitialized()) {
          setIsKakaoSdkReady(true);
        } else {
            console.warn("Kakao SDK not ready after delay.");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // 閲覧数をカウントアップ（重複防止機能を削除）
    const updateViewCount = async () => {
      try {
        const response = await fetch(`/api/japan-info/${info.id}/view`, {
          method: 'POST',
        });
        const data = await response.json();
        
        if (data.success && data.views) {
          setLocalViews(data.views);
        }
      } catch (error) {
        console.error('閲覧数の更新に失敗しました:', error);
      }
    };
    
    updateViewCount();
  }, [info.id, info.title, info.korean_title, language]);

  const twitterShareUrl = currentUrl 
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}` 
    : ''; // URLが取得できるまで空文字

  // KakaoTalk 共有関数
  const shareOnKakao = () => {
    if (!isKakaoSdkReady) {
      toast.error('카카오톡 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      console.error("Kakao SDK is not ready for sharing.");
      return;
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareText,
        description: language === 'ko' ? info.korean_description || info.description : info.description,
        imageUrl: info.image_url, // メイン画像を使用
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: language === 'ko' ? '자세히 보기' : '詳しく見る',
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    });
  };

  // リンクコピー関数
  const copyLinkToClipboard = async () => {
    if (!currentUrl) return;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success(language === 'ko' ? '링크가 복사되었습니다' : 'リンクがコピーされました');
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error);
      toast.error(language === 'ko' ? '링크 복사에 실패했습니다' : 'リンクのコピーに失敗しました');
    }
  };

  return (
    <main>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
        {/* ヘッダー: 戻るボタン */}
        <header className="flex items-center p-4 border-b border-gray-200">
          <Link href="/japan-info" className="flex items-center text-gray-600 hover:text-[#00CBB3] transition-colors">
            <ArrowLeft className="h-5 w-5 mr-1" />
            {language === 'ko' ? '정보 목록으로 돌아가기' : '情報一覧に戻る'}
          </Link>
        </header>

        {/* メイン画像 */}
        <div className="relative h-64 md:h-80 w-full">
          <Image
            src={info.image_url}
            alt={language === 'ko' ? info.korean_title || info.title : info.title}
            fill
            className="object-cover"
            priority // LCPのために優先読み込み
          />
        </div>

        {/* コンテンツエリア */}
        <article className="p-6 md:p-8">
          {/* タイトル */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            {language === 'ko' ? info.korean_title || info.title : info.title}
          </h1>

          {/* メタ情報 (閲覧数、場所、タグ) */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 space-x-4">
            {(localViews !== undefined || info.views !== undefined) && (
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{localViews ?? info.views} {language === 'ko' ? '조회' : '閲覧'}</span>
              </div>
            )}
            {info.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>{info.location}</span>
              </div>
            )}
          </div>
          
          {info.tags && info.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-6">
                <TagIcon className="w-4 h-4 mr-1 text-gray-500 self-center" />
               {info.tags.map((tag, index) => (
                 <span key={index} className={`bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded ${tag === '인기' ? 'font-bold text-amber-600' : ''}`}> {/* 人気タグを強調 */} 
                   #{tag}
                 </span>
               ))}
             </div>
           )}

          {/* 本文 (Markdown) */}
          <div className="prose prose-lg max-w-none text-gray-800">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {language === 'ko' ? info.korean_content || info.content : info.content}
            </Markdown>
          </div>

          {/* SNS共有ボタン */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <span className="text-sm text-gray-600">친구랑 공유하기✉️:</span>
            {/* X 共有ボタン */}
            {twitterShareUrl && ( // URLが生成されてから表示
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                aria-label="Share on X"
              >
                <Image 
                  src="/icons/x-logo-black.svg" 
                  alt="X Logo" 
                  width={24} 
                  height={24}
                />
              </a>
            )}
            {/* KakaoTalk 共有ボタン */}
            <button
              onClick={shareOnKakao}
              className={`p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors ${!isKakaoSdkReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Share on KakaoTalk"
              disabled={!isKakaoSdkReady} // SDK準備完了まで無効化
            >
              <Image 
                src="/icons/kakao-logo-darker.svg" 
                alt="KakaoTalk Logo" 
                width={24} 
                height={24}
              />
            </button>
            {/* リンクコピーボタン */}
            <button
              onClick={copyLinkToClipboard}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label={language === 'ko' ? '링크 복사' : 'リンクをコピー'}
            >
              <LinkIcon className="w-[24px] h-[24px] text-gray-700" />
            </button>
          </div>
        </article>
      </div>

      {/* リクエストフォームカード */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <CtaBanner />
      </div>
    </main>
  );
} 