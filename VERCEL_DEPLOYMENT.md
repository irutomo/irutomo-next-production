# Vercelデプロイ手順

## 前提条件
- Vercelアカウント
- Gitリポジトリ（GitHub, GitLab, Bitbucketいずれか）へのアクセス権

## デプロイ手順

### 1. Vercelへのプロジェクトインポート

1. [Vercelダッシュボード](https://vercel.com/dashboard)にログインする
2. 「Add New...」→「Project」をクリックする
3. リポジトリのインポート画面で、対象のリポジトリを選択する
4. 以下の設定を確認/入力する：
   - **Framework Preset**: Next.js
   - **Root Directory**: ./（変更不要）
   - **Build and Output Settings**: 
     - **Build Command**: `next build`（デフォルト）
     - **Output Directory**: `.next`（デフォルト）
     - **Install Command**: `npm install`（デフォルト）
   - **Environment Variables**: 後述の手順で設定

### 2. 環境変数の設定

#### 方法1: ダッシュボードから手動で設定

1. デプロイ設定画面の「Environment Variables」セクションで以下の環境変数を設定する：
   - `NODE_ENV`: production
   - `NEXT_PUBLIC_SUPABASE_URL`: https://qgqebyunvamzfaaaypmd.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWF5cG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDA5NzcsImV4cCI6MjA1NzYxNjk3N30.PFK6UtIZ1UxteygEr3NwGEiVQryBF0yhiVVTPXlGyIo
   - `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWFhcG1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDQ4NDI1NCwiZXhwIjoyMDI2MDYwMjU0fQ.RvlqA9qj-dUMegS9KwVKRLUyUl-ll1J1jw9pu8UOsRo
   - （以下、.env.productionファイルに記載の他の環境変数も同様に設定する）

2. シークレットキーなどの機密情報には、「Sensitive」オプションをチェックする

#### 方法2: JSONファイルからインポート

1. 作成済みの `vercel-env.json` ファイルを使用する
2. Vercelダッシュボードのプロジェクト設定画面で「Environment Variables」タブを選択
3. 「Import」ボタンをクリックし、`vercel-env.json` ファイルをアップロード

### 3. デプロイ実行

1. 設定が完了したら「Deploy」ボタンをクリックしてデプロイを開始する
2. デプロイが完了するまで待機する（通常5〜10分程度）

### 4. ドメイン設定

1. デプロイ完了後、Vercelダッシュボードでプロジェクトを選択する
2. 「Settings」→「Domains」タブを選択する
3. 「Add」ボタンをクリックして、カスタムドメイン「irutomo-trip.com」を追加する
4. ドメインの検証と設定手順に従って設定を完了する：
   - ドメインレジストラでのDNS設定
   - または、Vercelのネームサーバーへの変更

### 5. デプロイ後の確認事項

1. サイトの動作確認
   - 各ページの表示
   - 認証機能（Supabase認証）
   - 予約フロー
   - 決済処理
   
2. エラー確認
   - Vercelダッシュボードの「Logs」セクションでエラーログを確認
   - 「Function Logs」でサーバーサイド関数のログを確認

3. パフォーマンス確認
   - 「Analytics」タブでCore Web Vitalsなどのパフォーマンス指標を確認

## 環境変数の更新方法

デプロイ後に環境変数を更新する場合：

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」タブを選択
3. 更新したい環境変数を編集または新しい環境変数を追加
4. 変更を保存し、「Redeploy」ボタンをクリックして再デプロイ

## トラブルシューティング

### 環境変数が反映されない
- 環境変数を追加した後は、必ず再デプロイを行う
- 環境変数が正しい環境（Production/Preview/Development）に設定されているか確認

### ビルドエラー
- ビルドログを確認して具体的なエラーを特定
- package.jsonのdependenciesが正しいか確認
- Node.jsバージョンの互換性を確認

### デプロイ後のAPIエラー
- Serverless関数のログを確認
- APIエンドポイントが正しく設定されているか確認
- CORSの設定が適切か確認

### 認証関連の問題
- Supabase認証設定が正しいか確認
- 本番環境でのCORS設定を確認

## 参考リソース

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.js公式デプロイガイド](https://nextjs.org/docs/deployment)
- [Vercel環境変数ガイド](https://vercel.com/docs/environment-variables) 