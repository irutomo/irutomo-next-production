// Playwrightを使った簡単なテストスクリプト
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
  
  // 検索ボックスに入力
  await page.fill('textarea[name="q"]', 'Playwright MCP テスト');
  console.log('検索ボックスに入力しました');
  
  // 検索ボタンをクリック
  await page.press('textarea[name="q"]', 'Enter');
  console.log('検索ボタンをクリックしました');
  
  // 結果が表示されるまで待機
  await page.waitForSelector('#search');
  console.log('検索結果が表示されました');
  
  // スクリーンショットを撮る
  await page.screenshot({ path: 'mcp-test-screenshot.png' });
  console.log('スクリーンショットを撮りました: mcp-test-screenshot.png');
  
  // ページのタイトルを取得
  const title = await page.title();
  console.log('ページタイトル:', title);
  
  // 3秒待機
  await page.waitForTimeout(3000);
  
  // ブラウザを閉じる
  await browser.close();
  console.log('テスト完了');
})().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
}); 