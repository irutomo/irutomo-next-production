'use client';

// ===================================
// コンテンツ保護コンポーネント
// テキストコピー・画像保存・右クリック等を防ぐ
// ===================================

import { useEffect, ReactNode } from 'react';

interface ContentProtectionProps {
  children: ReactNode;
  enableProtection?: boolean;
  enableDevToolsDetection?: boolean;
}

export function ContentProtection({ 
  children, 
  enableProtection = true,
  enableDevToolsDetection = true 
}: ContentProtectionProps) {
  useEffect(() => {
    if (!enableProtection) return;

    // テキスト選択を無効化
    const disableSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 右クリックメニューを無効化
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // ドラッグを無効化
    const disableDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // キーボードショートカットを無効化
    const disableKeyShortcuts = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I, Ctrl+U
      if (e.ctrlKey || e.metaKey) {
        if (
          e.key === 'c' || // コピー
          e.key === 'a' || // 全選択
          e.key === 's' || // 保存
          e.key === 'p' || // 印刷
          e.key === 'u' || // ソース表示
          (e.shiftKey && e.key === 'I') // デベロッパーツール
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // F12キー（デベロッパーツール）を無効化
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      return true;
    };

    // デベロッパーツール検知
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const detectDevTools = () => {
      if (!enableDevToolsDetection) return;

      const threshold = 160;
      
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // デベロッパーツールが開かれた時の処理
          console.clear();
          document.body.style.display = 'none';
          setTimeout(() => {
            if (document.body.style.display === 'none') {
              window.location.reload();
            }
          }, 1000);
        }
      } else {
        devtools.open = false;
        if (document.body.style.display === 'none') {
          document.body.style.display = '';
        }
      }
    };

    // コンソールログの無効化
    const disableConsole = () => {
      const noop = () => {};
      ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 
       'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd']
        .forEach(method => {
          (console as any)[method] = noop;
        });
    };

    // イベントリスナーを追加
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('dragstart', disableDrag);
    document.addEventListener('drop', disableDrag);
    document.addEventListener('keydown', disableKeyShortcuts);

    // 定期的なデベロッパーツール検知
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // 本番環境でのみコンソールを無効化
    if (process.env.NODE_ENV === 'production') {
      disableConsole();
    }

    // CSS で選択やドラッグを無効化
    const style = document.createElement('style');
    style.textContent = `
      .content-protection {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .content-protection img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
      
      .content-protection * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      /* 印刷を無効化 */
      @media print {
        .content-protection {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // クリーンアップ
    return () => {
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('dragstart', disableDrag);
      document.removeEventListener('drop', disableDrag);
      document.removeEventListener('keydown', disableKeyShortcuts);
      
      clearInterval(devToolsInterval);
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      
      // body の表示を復元
      if (document.body.style.display === 'none') {
        document.body.style.display = '';
      }
    };
  }, [enableProtection, enableDevToolsDetection]);

  if (!enableProtection) {
    return <>{children}</>;
  }

  return (
    <div 
      className="content-protection"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// 画像専用の保護コンポーネント
interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ProtectedImage({ 
  src, 
  alt, 
  className = '',
  width,
  height,
  priority = false
}: ProtectedImageProps) {
  return (
    <span className="relative inline-block">
      <img
        src={src}
        alt={alt}
        className={`${className} select-none pointer-events-none`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          display: 'block'
        } as React.CSSProperties}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
        width={width}
        height={height}
      />
      {/* 透明なオーバーレイで右クリックを完全にブロック */}
      <span 
        className="absolute inset-0 z-10 cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ 
          background: 'transparent',
          pointerEvents: 'auto',
          display: 'block'
        }}
      />
    </span>
  );
} 