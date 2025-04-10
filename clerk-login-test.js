// Playwrightを使ったClerkログインテスト
const { chromium } = require('playwright');
const path = require('path');
// .env.testファイルを読み込む
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });

(async () => {
  console.log('Clerkログインテストを開始します...');
  
  // テストユーザー情報（本番環境ではセキュアな方法で管理してください）
  // 環境変数から読み込むか、ここで直接設定します
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
  // Google認証用
  const googleEmail = process.env.GOOGLE_TEST_EMAIL || 'テスト用Googleメールを入力';
  const googlePassword = process.env.GOOGLE_TEST_PASSWORD || 'テスト用Googleパスワードを入力';
  
  // テスト用の環境変数を表示
  console.log('Clerk関連の環境変数:');
  console.log(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '設定済み' : '未設定'}`);
  console.log(`NEXT_PUBLIC_CLERK_SIGN_IN_URL: ${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '未設定'}`);
  console.log(`NEXT_PUBLIC_CLERK_FRONTEND_API: ${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '未設定'}`);
  
  // ブラウザを起動
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // 操作をゆっくり見えるようにする（ミリ秒）
  });
  console.log('ブラウザを起動しました');
  
  // 新しいページを開く
  const page = await browser.newPage();
  console.log('新しいページを開きました');
  
  try {
    // ログインページにアクセス
    // アプリケーションのURLを設定
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/auth/sign-in'}`;
    
    await page.goto(loginUrl);
    console.log(`ログインページにアクセスしました: ${loginUrl}`);
    
    // ページのスクリーンショットを撮る（ログインページ）
    await page.screenshot({ path: 'clerk-login-page.png' });
    console.log('ログインページのスクリーンショットを撮りました: clerk-login-page.png');
    
    // ページのHTML構造を確認
    console.log('ページの内容を確認します...');
    
    // Googleログインボタンがあるか確認
    const googleLoginButton = await page.$('button:has-text("Continue with Google")') || 
                            await page.$('button:has-text("Sign in with Google")') || 
                            await page.$('button:has-text("Googleでログイン")') ||
                            await page.$('button:has-text("Google")');
    
    if (googleLoginButton) {
      console.log('Googleログインボタンが見つかりました');
      
      // Googleログインボタンをクリック
      await googleLoginButton.click();
      console.log('Googleログインボタンをクリックしました');
      
      // Googleログイン画面が表示されるのを待つ
      await page.waitForNavigation({ timeout: 15000 });
      console.log('Googleログイン画面に遷移しました');
      
      // 現在のURLを確認
      const currentUrl = page.url();
      console.log(`現在のURL: ${currentUrl}`);
      
      // ログイン画面のスクリーンショット
      await page.screenshot({ path: 'google-login-page.png' });
      console.log('Googleログイン画面のスクリーンショットを撮りました: google-login-page.png');
      
      // Googleログインページでメールアドレスを入力
      if (await page.$('input[type="email"]')) {
        await page.fill('input[type="email"]', googleEmail);
        console.log('Googleメールアドレスを入力しました');
        
        // 次へボタンをクリック
        const nextButton = await page.$('button:has-text("次へ")') || 
                          await page.$('button:has-text("Next")');
        if (nextButton) {
          await nextButton.click();
          console.log('次へボタンをクリックしました');
          
          // パスワード入力フィールドが表示されるのを待つ
          await page.waitForSelector('input[type="password"]', { timeout: 10000 });
          console.log('パスワード入力フィールドが表示されました');
          
          // パスワードを入力
          await page.fill('input[type="password"]', googlePassword);
          console.log('Googleパスワードを入力しました');
          
          // ログインボタンをクリック
          const signInButton = await page.$('button:has-text("ログイン")') ||
                             await page.$('button:has-text("Sign in")');
          if (signInButton) {
            await signInButton.click();
            console.log('ログインボタンをクリックしました');
            
            // アプリケーションにリダイレクトされるのを待つ
            const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/';
            await page.waitForURL(`${baseUrl}${afterSignInUrl}`, { timeout: 30000 });
            console.log(`ログイン成功：${baseUrl}${afterSignInUrl} にリダイレクトされました`);
            
            // ログイン後のページのスクリーンショットを撮る
            await page.screenshot({ path: 'clerk-login-success.png' });
            console.log('ログイン後のスクリーンショットを撮りました: clerk-login-success.png');
          } else {
            console.log('ログインボタンが見つかりませんでした');
          }
        } else {
          console.log('次へボタンが見つかりませんでした');
        }
      } else {
        console.log('メールアドレス入力フィールドが見つかりませんでした');
      }
    } else {
      console.log('Googleログインボタンが見つかりません。メール/パスワードログインを試みます...');
      
      // 通常のメール/パスワードログインを試みる
      try {
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        console.log('メール入力フィールドが見つかりました');
        
        // メールアドレスを入力
        await page.fill('input[type="email"]', testEmail);
        console.log('メールアドレスを入力しました');
        
        // 続行ボタンを探して押す
        const continueButton = await page.getByRole('button', { name: /continue|続行|次へ/i });
        if (continueButton) {
          await continueButton.click();
          console.log('続行ボタンをクリックしました');
        }
        
        // パスワードフィールドが表示されるのを待つ
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        console.log('パスワード入力フィールドが見つかりました');
        
        // パスワードを入力
        await page.fill('input[type="password"]', testPassword);
        console.log('パスワードを入力しました');
        
        // サインインボタンをクリック
        const signInButton = await page.getByRole('button', { name: /sign in|ログイン|サインイン/i });
        if (signInButton) {
          await signInButton.click();
          console.log('サインインボタンをクリックしました');
        }
        
        // ログイン後のリダイレクトを待つ
        const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/';
        await page.waitForURL(`${baseUrl}${afterSignInUrl}`, { timeout: 15000 });
        console.log(`ログイン成功：${baseUrl}${afterSignInUrl} にリダイレクトされました`);
        
        // ログイン後のページのスクリーンショットを撮る
        await page.screenshot({ path: 'clerk-login-success.png' });
        console.log('ログイン後のスクリーンショットを撮りました: clerk-login-success.png');
        
      } catch (selectorError) {
        console.error('セレクターエラー:', selectorError.message);
        
        // Clerkの要素が見つからない場合、ページの詳細情報を取得
        console.log('ページ上の全ての入力フィールドとボタンを検索します...');
        
        // すべての入力フィールドの情報を取得
        const inputs = await page.$$eval('input', inputs => {
          return inputs.map(input => ({
            type: input.type,
            id: input.id,
            name: input.name,
            placeholder: input.placeholder,
            className: input.className
          }));
        });
        console.log('入力フィールド:', JSON.stringify(inputs, null, 2));
        
        // すべてのボタンの情報を取得
        const buttons = await page.$$eval('button', buttons => {
          return buttons.map(button => ({
            text: button.textContent.trim(),
            id: button.id,
            className: button.className
          }));
        });
        console.log('ボタン:', JSON.stringify(buttons, null, 2));
        
        // ページの全体構造のスクリーンショットを撮る
        await page.screenshot({ path: 'clerk-login-debug.png', fullPage: true });
        console.log('デバッグ用スクリーンショットを撮りました: clerk-login-debug.png');
      }
    }
    
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error.message);
    
    // エラー発生時のスクリーンショットを撮る
    await page.screenshot({ path: 'clerk-login-error.png' });
    console.log('エラー時のスクリーンショットを撮りました: clerk-login-error.png');
  } finally {
    // 10秒待機して結果を確認
    await page.waitForTimeout(10000);
    
    // ブラウザを閉じる
    await browser.close();
    console.log('テスト完了');
  }
})().catch(err => {
  console.error('予期せぬエラーが発生しました:', err);
  process.exit(1);
}); 