# Vercelデプロイ手順

このドキュメントでは、irutomo-nextjsアプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubアカウントでサインアップ可能）
- 正しく設定されたGitの認証情報

## デプロイ手順

1. **GitHubリポジトリの確認**
   - 最新の変更がすべてコミットされ、GitHubにプッシュされていることを確認します
   - Gitユーザー情報が正しく設定されていることを確認します:
     ```bash
     git config --local user.name "あなたのGitHubユーザー名"
     git config --local user.email "あなたのGitHubメールアドレス"
     ```

2. **Vercelにログイン**
   - [Vercel](https://vercel.com)にアクセスし、GitHubアカウントでログインします

3. **新規プロジェクトの作成**
   - 「New Project」をクリックします
   - GitHubリポジトリ「irutomo-nextjs-ver」を選択します

4. **プロジェクト設定**
   - フレームワークプリセット: Next.js
   - ビルドコマンド: デフォルト（`next build`）
   - 出力ディレクトリ: デフォルト（`.next`）
   - 環境変数: 必要に応じて設定（Supabase接続情報など）

5. **デプロイ**
   - 「Deploy」ボタンをクリックしてデプロイを開始します
   - デプロイが完了すると、プロジェクトURLが表示されます

## 更新のデプロイ

コードを更新した場合は、以下の手順でデプロイできます:

1. ローカルで変更を加えてコミットします
   ```bash
   git add .
   git commit -m "変更内容の説明"
   ```

2. GitHubにプッシュします
   ```bash
   git push origin main
   ```

3. Vercelが自動的に新しいデプロイを開始します

## トラブルシューティング

### コミット作者情報エラー

「A commit author is required」というエラーが表示される場合:

1. Gitの設定を確認します
   ```bash
   git config --local --get user.name
   git config --local --get user.email
   ```

2. 設定が正しくない場合は、GitHubアカウントと一致するように更新します
   ```bash
   git config --local user.name "あなたのGitHubユーザー名"
   git config --local user.email "あなたのGitHubメールアドレス"
   ```

3. 小さな変更を加えて新しくコミットし、プッシュします
   ```bash
   # 何か変更を加える
   git add .
   git commit -m "Fix: コミット作者情報を修正"
   git push origin main
   ```

4. Vercelでもう一度デプロイを試みます

## 参考リソース

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.js公式デプロイガイド](https://nextjs.org/docs/deployment)
- [Vercel環境変数ガイド](https://vercel.com/docs/environment-variables) 