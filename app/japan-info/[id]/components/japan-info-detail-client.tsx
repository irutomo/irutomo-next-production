'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JapanInfo } from '@/types/japan-info';
import { ArrowLeft, MapPinIcon, TagIcon, EyeIcon, LinkIcon, Share, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast'; // 通知用

// Kakao SDK の型を一時的に any として定義
declare global {
  interface Window {
    Kakao: any;
  }
}

interface JapanInfoDetailProps {
  japanInfo: JapanInfo;
}

export default function JapanInfoDetailClient({ japanInfo }: JapanInfoDetailProps) {
  const [language, setLanguage] = useState<'ja' | 'ko'>('ko');
  const [currentUrl, setCurrentUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const [isKakaoSdkReady, setIsKakaoSdkReady] = useState(false);
  const [localViews, setLocalViews] = useState<number | undefined>(japanInfo.views);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // ブラウザのlocalStorageから言語設定を取得（サーバーコンポーネントで取得したものを上書き）
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ja' || savedLanguage === 'ko') {
      setLanguage(savedLanguage);
    }

    // クライアントサイドでのみ window オブジェクトにアクセス
    setCurrentUrl(window.location.href);
    setShareText(language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title);

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
        const response = await fetch(`/api/japan-info/${japanInfo.id}/view`, {
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

    // いいね数を取得（実際はDBからフェッチする）
    setLikeCount(Math.floor(Math.random() * 100));
    
    // このユーザーがいいねしているかどうかを確認
    const liked = localStorage.getItem(`liked_japan_info_${japanInfo.id}`);
    setIsLiked(!!liked);
  }, [japanInfo.id, japanInfo.title, japanInfo.korean_title, language]);

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
        description: language === 'ko' ? japanInfo.korean_description || japanInfo.description : japanInfo.description,
        imageUrl: japanInfo.image_url, // メイン画像を使用
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

  // 言語切り替え関数
  const toggleLanguage = () => {
    const newLang = language === 'ja' ? 'ko' : 'ja';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // いいね機能
  const handleLike = () => {
    if (!isLiked) {
      setLikeCount(prevCount => prevCount + 1);
      setIsLiked(true);
      localStorage.setItem(`liked_japan_info_${japanInfo.id}`, 'true');
      // APIコールでいいねを保存（実装省略）
    } else {
      setLikeCount(prevCount => Math.max(0, prevCount - 1));
      setIsLiked(false);
      localStorage.removeItem(`liked_japan_info_${japanInfo.id}`);
      // APIコールでいいねを削除（実装省略）
    }
  };

  // シェア機能
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title,
        text: language === 'ko' ? japanInfo.korean_description || japanInfo.description : japanInfo.description,
        url: window.location.href,
      })
      .catch((error) => console.error('シェアに失敗しました:', error));
    } else {
      // シェア機能に対応していない場合はURLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('URLをクリップボードにコピーしました'))
        .catch(err => console.error('コピーに失敗しました:', err));
    }
  };

  const title = language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title;
  const content = language === 'ko' ? japanInfo.korean_content || japanInfo.content : japanInfo.content;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* バックリンク */}
      <div className="mb-6">
        <Link href="/japan-info" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>{language === 'ko' ? '일본 정보 목록으로 돌아가기' : '日本情報一覧に戻る'}</span>
        </Link>
      </div>

      {/* 言語切り替えボタン */}
      <div className="mb-6 flex justify-end">
        <button 
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {language === 'ko' ? '日本語で表示' : '한국어로 보기'}
        </button>
      </div>

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <div className="flex items-center justify-between text-gray-600 mb-4">
          <div className="flex items-center">
            {japanInfo.author && <span className="mr-4">{japanInfo.author}</span>}
            {japanInfo.published_at && (
              <span>{new Date(japanInfo.published_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
              onClick={handleLike}
            >
              <ThumbsUp className="mr-1 h-5 w-5" />
              <span>{likeCount}</span>
            </button>
            <button 
              className="flex items-center text-gray-600"
              onClick={handleShare}
            >
              <Share className="mr-1 h-5 w-5" />
              <span>{language === 'ko' ? '공유' : 'シェア'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* メイン画像 */}
      {japanInfo.image_url && (
        <div className="mb-8 relative aspect-video w-full overflow-hidden rounded-xl">
          <Image 
            src={japanInfo.image_url}
            alt={title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* コンテンツ */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 追加画像があれば表示 */}
      {japanInfo.images && japanInfo.images.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ko' ? '추가 이미지' : '追加画像'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {japanInfo.images.map((img, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-xl">
                <Image 
                  src={img}
                  alt={`${title} - image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* タグがあれば表示 */}
      {japanInfo.tags && japanInfo.tags.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-3">
            {language === 'ko' ? '태그' : 'タグ'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {japanInfo.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/japan-info?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 埋め込みリンクがあれば表示 */}
      {japanInfo.embed_links && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-3">
            {language === 'ko' ? '관련 링크' : '関連リンク'}
          </h3>
          <div className="space-y-4">
            {japanInfo.embed_links.youtube && (
              <div className="aspect-video">
                <iframe 
                  src={japanInfo.embed_links.youtube} 
                  title="YouTube video player" 
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {japanInfo.embed_links.instagram && (
              <div className="overflow-hidden rounded-xl bg-gray-100 p-4">
                <a 
                  href={japanInfo.embed_links.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {language === 'ko' ? '인스타그램 게시물 보기' : 'Instagramの投稿を見る'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
} 