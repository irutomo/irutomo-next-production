'use client';

// ===================================
// 目次（Table of Contents）コンポーネント
// ===================================

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, List } from 'lucide-react';
import { TocItem } from '../../lib/utils';
import { LanguageKey, japanInfoTranslations } from '../../lib/translations';
import { getFontClass } from '../../lib/utils';

interface TableOfContentsProps {
  tocItems: TocItem[];
  language: LanguageKey;
}

interface TocItemComponentProps {
  item: TocItem;
  language: LanguageKey;
  isExpanded: boolean;
  onToggle: () => void;
  activeId?: string;
}

// ===================================
// 個別目次アイテムコンポーネント
// ===================================
function TocItemComponent({ 
  item, 
  language, 
  isExpanded, 
  onToggle, 
  activeId 
}: TocItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeId === item.id;
  const fontClass = getFontClass(language);
  
  // インデントレベルに応じたスタイル
  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'pl-0';
      case 2: return 'pl-4';
      case 3: return 'pl-8';
      case 4: return 'pl-12';
      default: return 'pl-16';
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 該当する見出しにスムーズスクロール
    const element = document.getElementById(item.id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      
      // URLハッシュを更新（履歴には追加しない）
      history.replaceState(null, '', `#${item.id}`);
    }
  };
  
  return (
    <div>
      <div className={`flex items-center ${getIndentClass(item.level)}`}>
        {hasChildren && (
          <button
            onClick={onToggle}
            className="mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? '折りたたみ' : '展開'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
        
        <a
          href={`#${item.id}`}
          onClick={handleClick}
          className={`
            flex-1 py-2 px-3 rounded-md text-sm transition-colors
            ${isActive 
              ? 'bg-accent text-white font-medium' 
              : 'text-gray-700 hover:text-accent hover:bg-gray-50'
            }
            ${fontClass}
          `}
        >
          {item.text}
        </a>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <TocItemComponent
              key={child.id}
              item={child}
              language={language}
              isExpanded={true} // 子要素は常に展開
              onToggle={() => {}} // 子要素の展開/折りたたみは無効
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================
// メイン目次コンポーネント
// ===================================
export function TableOfContents({ tocItems, language }: TableOfContentsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);
  
  // 初期表示時にすべての項目を展開
  useEffect(() => {
    const allIds = new Set<string>();
    const collectIds = (items: TocItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(tocItems);
    setExpandedItems(allIds);
  }, [tocItems]);
  
  // スクロール位置に応じてアクティブな見出しを更新
  useEffect(() => {
    const updateActiveId = () => {
      const headings = tocItems.flatMap(item => {
        const flatten = (items: TocItem[]): TocItem[] => {
          return items.flatMap(i => [i, ...(i.children ? flatten(i.children) : [])]);
        };
        return flatten([item]);
      });
      
      // 画面上部から一定の距離内にある見出しを取得
      const visibleHeadings = headings
        .map(item => {
          const element = document.getElementById(item.id);
          if (!element) return null;
          
          const rect = element.getBoundingClientRect();
          return {
            id: item.id,
            top: rect.top,
            element,
          };
        })
        .filter(item => item !== null && item.top <= 100) // 上部100px以内
        .sort((a, b) => b!.top - a!.top); // 上から順に並び替え
      
      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0]!.id);
      }
    };
    
    // 初期実行
    updateActiveId();
    
    // スクロールイベントリスナー
    window.addEventListener('scroll', updateActiveId, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateActiveId);
    };
  }, [tocItems]);
  
  // 目次項目の展開/折りたたみ
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // 目次が空の場合は表示しない
  if (tocItems.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      {/* ヘッダー */}
      <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
        <List className="w-5 h-5 text-accent mr-2" />
        <h2 className={`text-lg font-bold text-gray-900 ${fontClass}`}>
          {language === 'ja' ? '目次' : '목차'}
        </h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-auto md:hidden p-1 rounded hover:bg-gray-100"
          aria-label={isVisible ? '目次を隠す' : '目次を表示'}
        >
          {isVisible ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {/* 目次リスト */}
      <nav className={`space-y-1 ${!isVisible ? 'hidden md:block' : ''}`}>
        {tocItems.map((item) => (
          <TocItemComponent
            key={item.id}
            item={item}
            language={language}
            isExpanded={expandedItems.has(item.id)}
            onToggle={() => toggleExpanded(item.id)}
            activeId={activeId}
          />
        ))}
      </nav>
    </div>
  );
} 