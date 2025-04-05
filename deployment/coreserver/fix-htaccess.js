import { Client } from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESモジュールで__dirnameを取得するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FTP設定
const config = {
  host: 'v2007.coreserver.jp',
  user: 'irutomokrserver',
  password: 'TH8s4Zpy9q36',
  port: 21,
  secure: false
};

// リモートディレクトリ設定（public_htmlディレクトリに焦点）
const remoteDirs = [
  '/domains/irutomokrserver.v2007.coreserver.jp/public_html/',
  '/domains/irutomo-trip.com/public_html/'
];

async function uploadHtaccess() {
  console.log(`FTP接続を開始します: ${config.host}`);

  const client = new Client();
  client.ftp.verbose = true;

  try {
    // FTP接続
    await client.access(config);
    console.log('FTP接続成功');
    
    // Node.js用.htaccessファイルを読み込み
    const htaccessPath = path.join(__dirname, 'node-htaccess', '.htaccess');
    const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
    
    // 一時ファイルを作成
    const tempFile = path.join(__dirname, 'temp_htaccess');
    fs.writeFileSync(tempFile, htaccessContent);

    // 両方のドメインのpublic_htmlディレクトリに.htaccessファイルをアップロード
    for (const remoteDir of remoteDirs) {
      try {
        // ディレクトリに移動
        console.log(`リモートディレクトリに移動: ${remoteDir}`);
        await client.cd(remoteDir);
        
        // 現在のディレクトリを確認
        const currentDir = await client.pwd();
        console.log(`現在のディレクトリ: ${currentDir}`);

        // .htaccessファイルのアップロード
        console.log('.htaccessファイルをアップロード中...');
        await client.uploadFrom(
          tempFile, 
          '.htaccess'
        );

        console.log(`${remoteDir}への.htaccessファイルのアップロード成功！`);
      } catch (err) {
        console.error(`${remoteDir}へのアップロードエラー:`, err);
      }
    }

    // 一時ファイルを削除
    fs.unlinkSync(tempFile);
    
  } catch (err) {
    console.error('FTP接続エラー:', err);
  } finally {
    client.close();
    console.log('FTP接続を閉じました');
  }
}

uploadHtaccess(); 