# Google Drive画像のコアサーバー移行ガイド

このガイドでは、Google Driveに保存されている画像をコアサーバーに移行し、Supabaseのデータベースを更新する方法について説明します。

## 移行スクリプトについて

`migrate-images.js`スクリプトは以下の機能を提供します：

1. Supabaseからレストランデータを取得
2. Google DriveのURLを持つ画像をダウンロード
3. 画像をコアサーバーにアップロード
4. Supabaseのデータを新しいURLで更新

## 前提条件

- Node.js環境（v16以上）
- 必要なパッケージ：
  - @supabase/supabase-js
  - node-fetch
  - basic-ftp
  - dotenv

## 使用方法

### 1. 自動デプロイと画像移行（一括実行）

コアサーバーへのデプロイと画像移行を一括で実行する場合：

```bash
# デプロイと画像移行を一括実行
npm run deploy:coreserver && node deployment/coreserver/migrate-images.js
```

### 2. 画像移行のみ実行

既にデプロイ済みの環境で画像移行のみを実行する場合：

```bash
# 画像移行のみ実行
node deployment/coreserver/migrate-images.js
```

## 画像サービスの使用方法

画像サービス（`image-service.php`）は以下の機能を提供します：

### 1. 画像のアップロード

```
POST https://irutomo-trip.com/image-service.php?action=upload
```

パラメータ：
- `image`：アップロードする画像ファイル（multipart/form-data）
- `restaurantId`：レストランのID（オプション）
- `imageIndex`：画像のインデックス（オプション）

### 2. 画像の表示

```
GET https://irutomo-trip.com/image-service.php?action=view&file=restaurant_1234_main.jpg
```

パラメータ：
- `file`：表示する画像のファイル名

## 画像URL形式

移行後の画像URLは以下の形式になります：

```
https://irutomo-trip.com/images/restaurants/restaurant_{レストランID}_{インデックス}.jpg
```

例：
```
https://irutomo-trip.com/images/restaurants/restaurant_11111111-1111-1111-1111-111111111101_main.jpg
```

## トラブルシューティング

### 画像が表示されない場合

1. コアサーバーの画像ディレクトリが存在するか確認
```
/public_html/images/restaurants/
```

2. 権限設定を確認
```
chmod 755 /public_html/images/
chmod 755 /public_html/images/restaurants/
chmod 644 /public_html/images/restaurants/*.jpg
```

3. 移行ログを確認
```
cat image-migration.log
```

## サポート

問題が発生した場合は、開発チームにお問い合わせください。