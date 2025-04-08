// Service Worker for IRU TOMO Reservation PWA
const CACHE_VERSION = 'v1.1.0';
const STATIC_CACHE = `iru-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `iru-dynamic-${CACHE_VERSION}`;
const RESTAURANT_IMAGE_CACHE = `iru-restaurant-images-${CACHE_VERSION}`;

// 必ずキャッシュするファイルリスト
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/irulogo-hidariue.svg',
  '/images/landing-page-image1.jpg',
  '/images/landing-page-image2.jpg',
  '/images/landing-page-image3.jpg',
  '/images/landing-page-image4.jpg',
  // 料理タイプ別デフォルト画像
  '/images/cuisines/yakiniku1.jpg',
  '/images/cuisines/yakiniku2.jpg',
  '/images/cuisines/yakiniku3.jpg',
  '/images/cuisines/sushi1.jpg',
  '/images/cuisines/sushi2.jpg',
  '/images/cuisines/sushi3.jpg',
  '/images/cuisines/ramen1.jpg',
  '/images/cuisines/ramen2.jpg',
  '/images/cuisines/ramen3.jpg',
  '/images/reviews/yakitori.jpg',
  '/images/reviews/sake.jpg',
  '/images/reviews/oden.jpg',
  // レストランのデフォルト画像
  '/images/restaurants/restaurant1_main.jpg',
  '/images/restaurants/restaurant1_1.jpg',
  '/images/restaurants/restaurant1_2.jpg',
  '/images/restaurants/restaurant1_3.jpg',
  '/images/restaurants/restaurant2_main.jpg',
  '/images/restaurants/restaurant2_1.jpg',
  '/images/restaurants/restaurant2_2.jpg',
  '/images/restaurants/restaurant2_3.jpg',
  '/images/restaurants/restaurant3_main.jpg',
  '/images/restaurants/restaurant3_1.jpg',
  '/images/restaurants/restaurant3_2.jpg',
  '/images/restaurants/restaurant3_3.jpg',
  '/images/restaurants/restaurant4_main.jpg',
  '/images/restaurants/restaurant4_1.jpg',
  '/images/restaurants/restaurant4_2.jpg',
  '/images/restaurants/restaurant4_3.jpg',
];

// 外部リソースの処理設定
const EXTERNAL_RESOURCES = {
  images: {
    // Unsplash画像のパターン
    unsplash: /images\.unsplash\.com/,
    // Supabase Storageのパターン
    supabaseStorage: /supabase\.co\/storage\/v1\/object\/public/
  },
  fonts: {
    // Google Fontsのパターン
    googleFonts: /fonts\.(googleapis|gstatic)\.com/
  }
};

// デバッグモード
const DEBUG = true;

// ログ出力関数
const logger = {
  log: (...messages) => {
    if (DEBUG) {
      console.log('🍱 [Service Worker]', ...messages);
    }
  },
  error: (...messages) => {
    if (DEBUG) {
      console.error('❌ [Service Worker]', ...messages);
    }
  }
};

// キャッシュすべきかを判断する関数
const shouldCache = (url) => {
  const requestUrl = new URL(url);
  
  // APIリクエストはキャッシュしない
  if (requestUrl.pathname.includes('/api/')) {
    return false;
  }
  
  // 認証関連リクエストはキャッシュしない
  if (requestUrl.pathname.includes('/auth/') || requestUrl.pathname.includes('/clerk/')) {
    return false;
  }
  
  // 静的アセットや画像はキャッシュする
  if (
    requestUrl.pathname.startsWith('/images/') || 
    requestUrl.pathname.startsWith('/static/') ||
    requestUrl.pathname.endsWith('.jpg') ||
    requestUrl.pathname.endsWith('.png') ||
    requestUrl.pathname.endsWith('.svg') ||
    requestUrl.pathname.endsWith('.json')
  ) {
    return true;
  }
  
  // 外部リソースチェック
  // Unsplash画像
  if (EXTERNAL_RESOURCES.images.unsplash.test(requestUrl.href)) {
    return true;
  }
  
  // Supabase Storage
  if (EXTERNAL_RESOURCES.images.supabaseStorage.test(requestUrl.href)) {
    return true;
  }
  
  // Google Fonts
  if (EXTERNAL_RESOURCES.fonts.googleFonts.test(requestUrl.href)) {
    return true;
  }
  
  // レストラン画像パターンを検出
  if (requestUrl.pathname.includes('restaurant_') && 
      (requestUrl.pathname.endsWith('.jpg') || requestUrl.pathname.endsWith('.png'))) {
    return true;
  }
  
  // デフォルトはキャッシュしない
  return false;
};

// レストラン画像かどうかを判断する関数
const isRestaurantImage = (url) => {
  const requestUrl = new URL(url, self.location.origin);
  
  // レストラン画像のパターン
  if (requestUrl.pathname.includes('/images/restaurants/')) {
    return true;
  }
  
  // レストラン画像のUUIDパターン
  if (requestUrl.pathname.includes('restaurant_') && 
      (requestUrl.pathname.endsWith('.jpg') || requestUrl.pathname.endsWith('.png'))) {
    return true;
  }
  
  // Supabaseストレージのレストラン画像
  if (EXTERNAL_RESOURCES.images.supabaseStorage.test(requestUrl.href) && 
      requestUrl.href.includes('restaurants')) {
    return true;
  }
  
  return false;
};

// Service Workerのインストール
self.addEventListener('install', (event) => {
  logger.log('インストール中...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        logger.log('静的アセットをキャッシュ中...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        logger.log('インストール完了');
        return self.skipWaiting();
      })
      .catch(error => {
        logger.error('インストール中にエラーが発生しました:', error);
      })
  );
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  logger.log('アクティベート中...');
  
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return (
              cacheName.startsWith('iru-') && 
              !cacheName.endsWith(CACHE_VERSION)
            );
          }).map(cacheName => {
            logger.log(`古いキャッシュを削除: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        logger.log('アクティベート完了');
        return self.clients.claim();
      })
  );
});

// レストラン画像URLを正規化する関数
const normalizeRestaurantImageUrl = (url) => {
  const requestUrl = new URL(url, self.location.origin);
  
  // UUIDパターンの抽出（restaurant_UUID_type.jpg形式）
  const uuidPattern = /restaurant_([a-f0-9-]+)_(\w+)\.jpg/i;
  const match = requestUrl.pathname.match(uuidPattern);
  
  if (match) {
    // UUIDと画像タイプを抽出
    const [, uuid, type] = match;
    // 標準化されたURLを生成
    return `/images/restaurants/restaurant_${uuid}_${type}.jpg`;
  }
  
  // 既に/images/restaurants/で始まる場合は標準化
  if (requestUrl.pathname.startsWith('/images/restaurants/')) {
    return requestUrl.pathname;
  }
  
  // その他の場合は元のURLを返す
  return url;
};

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // レストラン画像リクエストの場合の特別処理
  if (isRestaurantImage(event.request.url)) {
    // ネットワークファースト戦略とフォールバック処理
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 成功した場合はレスポンスをクローンしてキャッシュ
          const responseClone = response.clone();
          caches.open(RESTAURANT_IMAGE_CACHE)
            .then(cache => cache.put(event.request, responseClone))
            .catch(err => logger.error('レストラン画像キャッシュエラー:', err));
          
          return response;
        })
        .catch(error => {
          logger.log('レストラン画像取得失敗、キャッシュから取得を試みます:', error);
          
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // 標準化したURLでもキャッシュをチェック
              const normalizedUrl = normalizeRestaurantImageUrl(event.request.url);
              return caches.match(new Request(normalizedUrl))
                .then(normalizedResponse => {
                  if (normalizedResponse) {
                    return normalizedResponse;
                  }
                  
                  // フォールバック画像を返す
                  logger.log('キャッシュにも見つからないため、フォールバック画像を返します');
                  return caches.match('/images/landing-page-image1.jpg');
                });
            });
        })
    );
    return;
  }
  
  // 静的アセットはキャッシュファースト戦略
  if (STATIC_ASSETS.includes(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          // キャッシュになければネットワークから取得
          logger.log('静的アセットがキャッシュにないためネットワークから取得:', requestUrl.pathname);
          return fetchAndCache(event.request, STATIC_CACHE);
        })
    );
    return;
  }
  
  // 画像やフォントなどの外部リソースに対する処理
  if (shouldCache(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // キャッシュにあれば返す
          if (response) {
            return response;
          }
          
          // キャッシュになければネットワークから取得してキャッシュに追加
          return fetchAndCache(event.request, DYNAMIC_CACHE);
        })
        .catch(error => {
          logger.error('リソース取得エラー:', error);
          
          // 画像の場合はフォールバック画像を返す
          if (event.request.destination === 'image') {
            return caches.match('/images/landing-page-image1.jpg');
          }
          
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }
  
  // その他のリクエストはネットワークファースト
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // HTML/JSON/CSSなど重要なリソースなら動的キャッシュに入れる
        if (shouldCache(event.request.url)) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, responseClone))
            .catch(err => logger.error('動的キャッシュエラー:', err));
        }
        return response;
      })
      .catch(error => {
        logger.error('ネットワークエラー:', error);
        
        // オフライン時にはキャッシュを試みる
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // APIリクエストの場合はエラーJSONを返す
            if (requestUrl.pathname.includes('/api/')) {
              return new Response(JSON.stringify({
                error: 'Network error',
                message: 'You are currently offline'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // HTML要求の場合はオフラインページを返す
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/');
            }
            
            // その他の場合は単純なエラーメッセージ
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// フェッチとキャッシュを行う補助関数
const fetchAndCache = (request, cacheName) => {
  return fetch(request)
    .then(response => {
      // 有効なレスポンスのみをキャッシュ
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(cacheName)
          .then(cache => cache.put(request, responseClone))
          .catch(err => logger.error('キャッシュエラー:', err));
      }
      return response;
    })
    .catch(error => {
      logger.error('フェッチエラー:', error);
      throw error;
    });
};

// 定期的なキャッシュクリーンアップ
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.filter(cacheName => {
              return cacheName.startsWith('iru-');
            }).map(cacheName => {
              logger.log(`キャッシュをクリア: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          logger.log('キャッシュクリア完了');
          // 再度静的アセットをキャッシュ
          return caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS));
        })
    );
  }
}); 