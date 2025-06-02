'use client';

// ===================================
// 記事反応スタンプコンポーネント
// ===================================

import { useState, useEffect } from 'react';
import { Heart, ThumbsUp, Smile, Star, Zap } from 'lucide-react';
import { LanguageKey } from '../../lib/translations';
import { getFontClass } from '../../lib/utils';

interface ReactionType {
  id: string;
  emoji: string;
  label: string;
  labelKo: string;
  icon: React.ReactNode;
  color: string;
}

interface ArticleReactionsProps {
  articleId: string;
  language: LanguageKey;
}

// 反応タイプの定義
const reactionTypes: ReactionType[] = [
  {
    id: 'like',
    emoji: '👍',
    label: 'いいね',
    labelKo: '좋아요',
    icon: <ThumbsUp className="w-4 h-4" />,
    color: 'hover:bg-blue-50 hover:text-blue-600'
  },
  {
    id: 'love',
    emoji: '❤️',
    label: '大好き',
    labelKo: '사랑해요',
    icon: <Heart className="w-4 h-4" />,
    color: 'hover:bg-red-50 hover:text-red-600'
  },
  {
    id: 'helpful',
    emoji: '⭐',
    label: '参考になった',
    labelKo: '도움이 됐어요',
    icon: <Star className="w-4 h-4" />,
    color: 'hover:bg-yellow-50 hover:text-yellow-600'
  },
  {
    id: 'fun',
    emoji: '😊',
    label: '面白い',
    labelKo: '재미있어요',
    icon: <Smile className="w-4 h-4" />,
    color: 'hover:bg-green-50 hover:text-green-600'
  },
  {
    id: 'amazing',
    emoji: '⚡',
    label: 'すごい',
    labelKo: '놀라워요',
    icon: <Zap className="w-4 h-4" />,
    color: 'hover:bg-purple-50 hover:text-purple-600'
  }
];

export function ArticleReactions({ articleId, language }: ArticleReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  const fontClass = getFontClass(language);

  // 初期データの読み込み（ローカルストレージから）
  useEffect(() => {
    const savedReactions = localStorage.getItem(`reactions-${articleId}`);
    const savedUserReactions = localStorage.getItem(`user-reactions-${articleId}`);
    
    if (savedReactions) {
      setReactions(JSON.parse(savedReactions));
    }
    
    if (savedUserReactions) {
      setUserReactions(new Set(JSON.parse(savedUserReactions)));
    }
  }, [articleId]);

  // 反応を追加/削除
  const handleReaction = async (reactionId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const hasReacted = userReactions.has(reactionId);
      const newReactions = { ...reactions };
      const newUserReactions = new Set(userReactions);
      
      if (hasReacted) {
        // 反応を削除
        newReactions[reactionId] = Math.max(0, (newReactions[reactionId] || 0) - 1);
        newUserReactions.delete(reactionId);
      } else {
        // 反応を追加
        newReactions[reactionId] = (newReactions[reactionId] || 0) + 1;
        newUserReactions.add(reactionId);
      }
      
      setReactions(newReactions);
      setUserReactions(newUserReactions);
      
      // ローカルストレージに保存
      localStorage.setItem(`reactions-${articleId}`, JSON.stringify(newReactions));
      localStorage.setItem(`user-reactions-${articleId}`, JSON.stringify(Array.from(newUserReactions)));
      
      // TODO: ここで実際のAPIコールを行う
      // await updateArticleReaction(articleId, reactionId, !hasReacted);
      
    } catch (error) {
      console.error('Failed to update reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className={`text-lg font-bold text-gray-900 mb-4 text-center ${fontClass}`}>
        {language === 'ja' ? 'この記事はどうでしたか？👀' : '이 기사는 어떠셨나요?👀'}
      </h3>
      
      <div className="flex flex-wrap justify-center gap-3">
        {reactionTypes.map((reaction) => {
          const hasReacted = userReactions.has(reaction.id);
          const count = reactions[reaction.id] || 0;
          const label = language === 'ja' ? reaction.label : reaction.labelKo;
          
          return (
            <button
              key={reaction.id}
              onClick={() => handleReaction(reaction.id)}
              disabled={isLoading}
              className={`
                flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200
                ${hasReacted 
                  ? 'border-accent bg-accent text-white scale-105' 
                  : 'border-gray-200 bg-white text-gray-700 hover:scale-105'
                }
                ${!hasReacted && reaction.color}
                disabled:opacity-50 disabled:cursor-not-allowed
                min-w-[80px] group
              `}
              aria-label={`${label} ${count > 0 ? count : ''}`}
            >
              {/* 絵文字とアイコン */}
              <div className="flex items-center justify-center mb-1">
                <span className="text-xl mr-1">{reaction.emoji}</span>
                {hasReacted && (
                  <div className="text-white">
                    {reaction.icon}
                  </div>
                )}
              </div>
              
              {/* ラベル */}
              <span className={`text-xs font-medium ${fontClass}`}>
                {label}
              </span>
              
              {/* カウント */}
              {count > 0 && (
                <span className={`text-xs mt-1 ${hasReacted ? 'text-white' : 'text-gray-500'} ${fontClass}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* 合計反応数 */}
      {Object.values(reactions).some(count => count > 0) && (
        <div className="text-center mt-4">
          <p className={`text-sm text-gray-600 ${fontClass}`}>
            {language === 'ja' 
              ? `${Object.values(reactions).reduce((sum, count) => sum + count, 0)}人が反応しました`
              : `${Object.values(reactions).reduce((sum, count) => sum + count, 0)}명이 반응했습니다`
            }
          </p>
        </div>
      )}
    </div>
  );
} 