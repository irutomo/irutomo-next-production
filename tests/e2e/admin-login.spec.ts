import { test, expect } from '@playwright/test';

test.describe('管理者ログインテスト', () => {
  // タイムアウトを長めに設定
  test.setTimeout(120000);

  test('有効な認証情報でログインできる', async ({ page }) => {
    // デバッグ用にブラウザを開いたままにする
    test.slow();
    
    console.log('テスト開始: 有効な認証情報でログインできる');
    
    // すべてのコンソールログを取得
    page.on('console', msg => {
      console.log(`ブラウザコンソール [${msg.type()}]: ${msg.text()}`);
    });
    
    // 管理者ログインページにアクセス
    console.log('ログインページにアクセス');
    await page.goto('http://localhost:3000/admin/login');
    
    // タイトルを確認
    console.log('タイトルを確認');
    const title = page.locator('h2:has-text("管理者ログイン")');
    await expect(title).toBeVisible();
    
    // HTMLを出力
    const html = await page.content();
    console.log('ページHTML:', html.substring(0, 500) + '...');
    
    // スクリーンショットを撮影
    await page.screenshot({ path: './login-page.png' });
    
    // ログインフォームに認証情報を入力
    console.log('認証情報を入力');
    await page.getByLabel('メールアドレス').fill('gespokrofficial@gmail.com');
    await page.getByLabel('パスワード').fill('gespokrofficial@gmail.com');
    
    // ネットワークリクエストをリッスン
    page.on('request', request => {
      console.log(`リクエスト: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`レスポンス: ${response.status()} ${response.url()}`);
    });
    
    // ログインボタンをクリック
    console.log('ログインボタンをクリック');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 少し待機
    console.log('5秒待機');
    await page.waitForTimeout(5000);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: './after-login-click.png' });
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);
    
    // ページのHTML全体をコンソールに出力
    console.log('ログイン後のHTML:', await page.content());
    
    try {
      // ダッシュボードへのリダイレクトを待機
      console.log('ダッシュボードへのリダイレクトを待機');
      await page.waitForURL(/.*\/admin\/dashboard/, { timeout: 30000 });
      console.log('リダイレクト成功');
    } catch (error: any) {
      console.error('リダイレクト失敗:', error.message);
      
      // ページ上のすべてのテキストを出力
      const bodyText = await page.locator('body').textContent();
      console.log('ページのテキスト内容:', bodyText);
      
      await page.screenshot({ path: './redirect-failed.png' });
    }
    
    // 現在のURLを再確認
    console.log('テスト終了時のURL:', page.url());
    await page.screenshot({ path: './test-end.png' });
  });

  test('無効な認証情報ではログインできない', async ({ page }) => {
    // デバッグ用にブラウザを開いたままにする
    test.slow();
    
    console.log('テスト開始: 無効な認証情報ではログインできない');
    
    // すべてのコンソールログを取得
    page.on('console', msg => {
      console.log(`ブラウザコンソール [${msg.type()}]: ${msg.text()}`);
    });
    
    // 管理者ログインページにアクセス
    await page.goto('http://localhost:3000/admin/login');
    
    // タイトルを確認
    const title = page.locator('h2:has-text("管理者ログイン")');
    await expect(title).toBeVisible();
    
    // スクリーンショットを撮影
    await page.screenshot({ path: './invalid-login-page.png' });
    
    // 無効な認証情報を入力
    await page.getByLabel('メールアドレス').fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    
    // ネットワークリクエストをリッスン
    page.on('request', request => {
      console.log(`リクエスト: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`レスポンス: ${response.status()} ${response.url()}`);
    });
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 少し待機
    console.log('5秒待機');
    await page.waitForTimeout(5000);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: './after-invalid-login.png' });
    
    // 無効な認証情報の場合はログインページに留まっていることを確認
    console.log('現在のURL:', page.url());
    
    // URLがログインページのままであることを確認
    await expect(page).toHaveURL(/.*\/admin\/login/);
    
    // エラーメッセージが表示されるかを確認（セレクタを複数試す）
    console.log('エラーメッセージを探しています...');
    
    // HTMLを出力
    const html = await page.content();
    console.log('ページHTML:', html);
    
    // すべてのエラー関連の要素を確認
    const possibleErrorSelectors = [
      '.bg-red-100',
      '.text-red-700',
      '.text-red-500',
      '.error-message',
      '.auth-error',
      'text=エラー',
      'text=失敗',
      'text=認証に失敗しました',
      'div[role="alert"]'
    ];
    
    for (const selector of possibleErrorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`セレクタ ${selector} で ${elements.length} 個の要素が見つかりました`);
          for (let i = 0; i < elements.length; i++) {
            const text = await elements[i].textContent();
            console.log(`- 要素 ${i+1}: ${text}`);
          }
        }
      } catch (e) {
        console.log(`セレクタ ${selector} の確認中にエラー: ${e}`);
      }
    }
    
    // 最終スクリーンショット
    await page.screenshot({ path: './invalid-login-end.png' });
  });
}); 