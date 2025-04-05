const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// FTP接続情報
const config = {
  host: process.env.FTP_HOST || 'v2007.coreserver.jp',
  user: process.env.FTP_USER || 'irutomokrserver',
  password: 'TH8s4Zpy9q36',
  secure: false,
  port: 21
};

// リモートディレクトリ
const remoteRoot = '/domains/irutomo-trip.com/public_html/';

// ローカルディレクトリ（静的ファイルのビルド出力）
const localDir = path.resolve(__dirname, 'out');

async function deployToFtp() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('FTPサーバーに接続しています...');
    await client.access(config);
    
    console.log('接続成功！ファイルをアップロードしています...');
    
    // リモートディレクトリを確認、なければ作成
    try {
      await client.ensureDir(remoteRoot);
    } catch (err) {
      console.log(`リモートディレクトリの確認中にエラーが発生しました: ${err.message}`);
      console.log('既存のディレクトリを使用します...');
    }
    
    // ファイルをアップロード
    console.log(`ローカルディレクトリからファイルをアップロードしています: ${localDir}`);
    await client.uploadFromDir(localDir, remoteRoot);
    
    console.log('デプロイが完了しました！');

  } catch (err) {
    console.error(`デプロイ中にエラーが発生しました: ${err.message}`);
  } finally {
    client.close();
  }
}

// スクリプト実行
deployToFtp(); 