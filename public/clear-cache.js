// ブラウザのキャッシュをクリアするスクリプト

// キャッシュストレージをクリア
function clearCacheStorage() {
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log(`キャッシュ ${cacheName} を削除しました`);
      });
    });
  }
}

// アプリケーションキャッシュをクリア
function clearAppCache() {
  if (window.applicationCache) {
    try {
      window.applicationCache.abort();
      window.applicationCache.swapCache();
      console.log('アプリケーションキャッシュをクリアしました');
    } catch (e) {
      console.error('アプリケーションキャッシュのクリア中にエラーが発生しました:', e);
    }
  }
}

// セッションストレージをクリア
function clearSessionStorage() {
  try {
    window.sessionStorage.clear();
    console.log('セッションストレージをクリアしました');
  } catch (e) {
    console.error('セッションストレージのクリア中にエラーが発生しました:', e);
  }
}

// LocalStorageをクリア (必要に応じてコメントアウト)
// function clearLocalStorage() {
//   try {
//     window.localStorage.clear();
//     console.log('LocalStorageをクリアしました');
//   } catch (e) {
//     console.error('LocalStorageのクリア中にエラーが発生しました:', e);
//   }
// }

// サービスワーカーを登録解除
function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('サービスワーカーの登録を解除しました');
      }
    });
  }
}

// リロードボタンクリック時に実行される関数
function performCacheClear() {
  clearCacheStorage();
  clearAppCache();
  clearSessionStorage();
  // clearLocalStorage();  // 必要に応じて有効化
  unregisterServiceWorkers();
  
  // キャッシュ制御ヘッダー付きでページをリロード
  window.location.reload(true);
}

// 自動実行（必要に応じてコメントアウト解除）
// document.addEventListener('DOMContentLoaded', performCacheClear);

// グローバルに関数を公開
window.clearBrowserCache = performCacheClear;

console.log('キャッシュクリアスクリプトがロードされました。window.clearBrowserCache()を実行してキャッシュをクリアできます。'); 