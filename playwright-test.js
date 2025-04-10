// Playwrightを使用した簡単なテストスクリプト
const { chromium } = require('playwright');

(async () => {
  console.log('Playwrightテストを開始します...');
  
  // ブラウザを起動
  const browser = await chromium.launch({ headless: false });
  console.log('ブラウザを起動しました');
  
  // 新しいページを開く
  const page = await browser.newPage();
  console.log('新しいページを開きました');
  
  // Googleにアクセス
  await page.goto('https://www.google.com');
  console.log('Googleにアクセスしました');
  
  // 少し待機
  await page.waitForTimeout(2000);
  
  // スクリーンショットを撮る
  await page.screenshot({ path: 'screenshot.png' });
  console.log('スクリーンショットを撮りました: screenshot.png');
  
  // ページのタイトルを取得
  const title = await page.title();
  console.log('ページタイトル:', title);
  
  // ブラウザを閉じる
  await browser.close();
  console.log('テスト完了');
})().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
}); 