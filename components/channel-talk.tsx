'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface ChannelTalkProps {
  pluginKey: string;
  accessSecret?: string;
}

declare global {
  interface Window {
    ChannelIO?: any;
    ChannelIOInitialized?: boolean;
  }
}

export function ChannelTalk({ pluginKey, accessSecret }: ChannelTalkProps) {
  const { language } = useLanguage();

  useEffect(() => {
    // Channel Talk初期化のスクリプト
    const initChannelIO = () => {
      if (window.ChannelIO) {
        console.log('ChannelIO already loaded');
        return;
      }

      const channelScript = function() {
        const w = window as any;
        if (w.ChannelIO) {
          return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
        }
        const ch = function() {
          ch.c(arguments);
        };
        ch.q = [] as any[];
        ch.c = function(args: any) {
          ch.q.push(args);
        };
        w.ChannelIO = ch;
        
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
        const x = document.getElementsByTagName('script')[0];
        if (x.parentNode) {
          x.parentNode.insertBefore(s, x);
        }
      };
      
      channelScript();

      window.ChannelIO('boot', {
        "pluginKey": pluginKey,
        "accessSecret": accessSecret,
        "language": language === 'ja' ? 'ja' : 'ko',
        "zIndex": 1000,
        "hideDefaultLauncher": false,
        "mobileMessengerMode": 'iframe'
      });
    };

    // 初期化実行
    if (!window.ChannelIOInitialized) {
      window.ChannelIOInitialized = true;
      initChannelIO();
    }

    // クリーンアップ関数
    return () => {
      if (window.ChannelIO) {
        window.ChannelIO('shutdown');
      }
    };
  }, [pluginKey, accessSecret, language]);

  return null;
} 