# イルトモサイトのデプロイ手順

このドキュメントでは、イルトモサイト（irutomo-trip.com）をコアサーバーにデプロイする手順を説明します。

## 前提条件

- Node.js環境（v16以上）
- 必要なパッケージのインストール：
  ```
  npm install basic-ftp dotenv
  ```
- コアサーバーのFTP接続情報

## デプロイ手順

### 1. 静的ファイルの生成

以下のコマンドを実行して、静的サイトファイルを生成します。

```bash
# 実行権限を付与
chmod +x deployment/coreserver/deploy-static.sh

# 静的ファイルを生成
./deployment/coreserver/deploy-static.sh
```

このスクリプトは `deployment/coreserver/out` ディレクトリに静的サイトファイルを生成します。

### 2. FTP設定の準備

`.env.deploy` ファイルを編集して、FTP接続情報を設定します。

```
# FTP接続情報
FTP_HOST=v2007.coreserver.jp
FTP_USER=irutomokrserver
FTP_PASSWORD=【正しいパスワードを入力】
REMOTE_ROOT=/public_html/
```

### 3. FTPでファイルをアップロード

以下のコマンドを実行して、生成した静的ファイルをFTP経由でアップロードします。

```bash
# 環境変数ファイルを読み込んでFTPアップロードを実行
cp .env.deploy .env && node deployment/coreserver/deploy-ftp.js
```

または、FTPクライアント（FileZilla、Cyberduckなど）を使用して、`deployment/coreserver/out` ディレクトリの内容をサーバーの `/public_html/` ディレクトリにアップロードすることもできます。

### 4. 動作確認

ブラウザで以下のURLにアクセスして、サイトが正しくデプロイされていることを確認します。

- https://irutomo-trip.com/
- https://irutomokrserver.v2007.coreserver.jp/

## トラブルシューティング

### FTP接続エラー

- FTP接続情報（ホスト名、ユーザー名、パスワード）が正しいか確認してください。
- ファイアウォールやネットワーク設定により、FTP接続（ポート21）がブロックされていないか確認してください。

### 404エラー

- `.htaccess` ファイルが正しくアップロードされているか確認してください。
- `.htaccess` ファイルの内容が正しいか確認してください。

### 画像やスタイルが表示されない

- ブラウザのキャッシュをクリアしてみてください。
- 開発者ツールのネットワークタブで、リソースが正しくロードされているか確認してください。

## 注意事項

- この方法は、静的なHTML・CSSのみをデプロイします。動的な機能（API、認証等）は制限されます。
- 本格的なデプロイには、サーバーサイド機能を持つホスティングサービス（Vercel、Netlify等）を検討してください。 