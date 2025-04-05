# コアサーバーデプロイガイド

このガイドでは、本アプリケーションをコアサーバーにデプロイする手順を詳細に説明します。フロントエンド、バックエンド、Webhook処理サーバーのデプロイメント方法を網羅しています。

## 前提条件

- Node.js環境（v16以上）
- コアサーバーのアカウント情報
  - ホスト: v2007.coreserver.jp
  - ユーザー名: irutomokrserver
  - パスワード: ※システム管理者から取得してください
- 必要なパッケージがインストールされていること：
  ```bash
  npm install ftp-deploy basic-ftp dotenv
  ```

## デプロイ前の準備

### 1. 環境変数の設定（オプション）

`.env.production` ファイルを作成し、以下の環境変数を設定します：

```
FTP_HOST=v2007.coreserver.jp
FTP_USER=irutomokrserver
FTP_PASSWORD=【パスワード】
REMOTE_ROOT=/public_html/
```

これらの環境変数を設定しない場合、デプロイスクリプトはデフォルト値を使用します。

### 2. アプリケーションのビルド

```bash
# アプリケーションをビルド
npm run build
```

ビルドが成功すると、`dist` ディレクトリに静的ファイルが生成されます。

## デプロイ手順

### 1. フロントエンドのデプロイ

フロントエンド（SPA）は静的ファイルとして `/public_html` ディレクトリにデプロイします：

```bash
# フロントエンドをコアサーバーにデプロイ
node deployment/coreserver/deploy-coreserver.js
```

このスクリプトは `ftp-deploy` パッケージを使用して、ビルドされた静的ファイルをアップロードします。

### 2. Webhook処理サーバーのデプロイ

Webhook処理サーバーは `/node-apps` ディレクトリにデプロイします：

```bash
# Webhook処理サーバーをデプロイ
node deployment/coreserver/deploy-webhook-server.js
```

このスクリプトは以下のファイルをコアサーバーにアップロードします：
- api/webhook.js
- scripts/start-webhook-server.js
- package.json
- package-lock.json

### 3. PM2設定のアップロード

Webhook処理サーバーをPM2で管理するための設定ファイルをアップロードします：

```bash
# PM2設定ファイルをアップロード
node deployment/coreserver/setup-pm2.cjs
```

### 4. Webhook処理サーバーの起動/再起動

サーバー側でWebhook処理サーバーを起動するためのコマンドを実行します：

```bash
# Webhook再起動スクリプトをアップロード
node deployment/coreserver/restart-webhook-server.cjs
```

スクリプトのアップロード後、サーバー側で以下のコマンドを実行する必要があります：
```bash
cd /home/irutomokrserver/node-apps
bash restart-webhook.sh
```

これらのコマンドはSSHまたはWebターミナルから実行します。

## 複数ドメイン管理

本アプリケーションは複数のドメインで提供されています：
- `irutomokrserver.v2007.coreserver.jp`
- `irutomo-trip.com`

それぞれのドメインに対応するため、以下の設定が必要です：

### 1. .htaccessファイルの管理

各ドメイン用の .htaccess ファイルを用意しています：
- `deployment/coreserver/.htaccess`： irutomo-trip.com 用
- `deployment/coreserver/irutomokrserver.htaccess`： irutomokrserver.v2007.coreserver.jp 用

### 2. 特定ドメイン用の.htaccessファイルのアップロード

```bash
# irutomokrserver.v2007.coreserver.jp用の.htaccessをアップロード
node deployment/coreserver/upload-htaccess-ssl.js
```

## SSL証明書の設定

SSL証明書の設定は別途 `deployment/coreserver/SSL_SETUP_GUIDE.md` に詳細が記載されています。基本的な手順は以下の通りです：

1. コアサーバーのコントロールパネルにログイン
2. 「SSL設定」→「無料SSL設定」を選択
3. 対象ドメインを選択し、SSL証明書を発行
4. HTTPS設定用の.htaccessファイルをアップロード

```bash
# SSL対応の.htaccessファイルをアップロード
node deployment/coreserver/upload-htaccess-ssl.js
```

## PayPal Webhook設定

PayPal WebhookはPM2で管理される永続的なNodeプロセスとして実行されます。設定手順は以下の通りです：

1. PayPalデベロッパーダッシュボードでWebhookを設定
   - Webhook URL: `https://irutomo-trip.com/api/paypal/webhook`
   - イベント: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED` など

2. .htaccessファイルでWebhookリクエストをリダイレクト
   ```apache
   # PayPal WebhookエンドポイントをAPIサーバーに転送
   RewriteRule ^api/paypal/webhook$ http://localhost:3001/api/paypal/webhook [P,L]
   ```

3. PM2でWebhook処理サーバーを管理
   ```bash
   # PM2ステータス確認
   pm2 status irutomo-webhook-server
   
   # ログの確認
   pm2 logs irutomo-webhook-server
   ```

## 環境変数の管理

本番環境の環境変数は `.htaccess` ファイルで設定されています。主な環境変数は以下の通りです：

```apache
# .htaccessでの環境変数設定例
SetEnv VITE_SUPABASE_URL "https://qgqebyunvamzfaaaypmd.supabase.co"
SetEnv VITE_SUPABASE_ANON_KEY "【シークレットキー】"
SetEnv VITE_REDIRECT_URL "https://irutomo-trip.com/auth/callback"
SetEnv VITE_PAYPAL_CLIENT_ID "【PayPalクライアントID】"
SetEnv VITE_PAYPAL_SECRET_KEY "【PayPalシークレットキー】"
SetEnv VITE_PAYPAL_WEBHOOK_URL "https://irutomo-trip.com/api/paypal/webhook"
SetEnv VITE_PAYPAL_WEBHOOK_ID "【PayPal Webhook ID】"
```

## デプロイ後の確認事項

デプロイ完了後、以下の点を確認してください：

1. フロントエンドが正しく表示されるか
   - `https://irutomo-trip.com/`
   - `https://irutomokrserver.v2007.coreserver.jp/`

2. API通信が正常に機能するか
   - レストラン一覧の取得
   - 認証機能
   - 予約フォームの送信

3. Webhook処理サーバーが動作しているか
   ```bash
   pm2 status irutomo-webhook-server
   ```

## トラブルシューティング

### よくある問題と解決策

#### 静的ファイルが更新されない
- ブラウザのキャッシュをクリアしてください
- `.htaccess` ファイルのキャッシュ設定を確認してください

#### APIエラーが発生する
- `.htaccess` ファイルでの環境変数設定を確認
- CORS設定が正しいか確認（CORSの許可オリジンに両方のドメインが追加されているか）

#### Webhook処理サーバーが起動しない
- PM2のログを確認
  ```bash
  pm2 logs irutomo-webhook-server
  ```
- 環境変数が正しく設定されているか確認
- ポートが既に使用されていないか確認

#### PM2設定が適用されない
- PM2が正しくインストールされているか確認
  ```bash
  npm list -g pm2
  ```
- PM2のセットアップスクリプトを再実行
  ```bash
  cd /home/irutomokrserver/node-apps
  bash setup-pm2.sh
  ```

## その他の参考ドキュメント

- SSL設定ガイド: `deployment/coreserver/SSL_SETUP_GUIDE.md`
- 画像移行ガイド: `deployment/coreserver/IMAGE_MIGRATION_GUIDE.md`
- SSL検証チェックリスト: `deployment/coreserver/SSL_VERIFICATION_CHECKLIST.md`

## サポート

問題が発生した場合は、開発チームにお問い合わせください。 