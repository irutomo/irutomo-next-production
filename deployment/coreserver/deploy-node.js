const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// FTP接続情報
const config = {
  host: 'v2007.coreserver.jp',
  user: 'irutomokrserver',
  password: 'TH8s4Zpy9q36',
  secure: false,
  port: 21
};

// リモートディレクトリ
const remoteNodeDir = '/home/irutomokrserver/node-apps/irutomo-nextjs/';

// アップロードするファイル
const filesToUpload = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  '.env',
  'middleware.ts',
  'tsconfig.json',
  'postcss.config.js',
  'tailwind.config.js',
  'components.json'
];

// アップロードするディレクトリ
const dirsToUpload = [
  'app',
  'components',
  'lib',
  'public',
  'styles'
];

// PM2設定ファイル内容
const pm2Config = `
module.exports = {
  apps: [
    {
      name: 'irutomo-nextjs',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/irutomokrserver/node-apps/irutomo-nextjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
`;

// プロジェクトのビルド
function buildProject() {
  console.log('Next.jsアプリケーションをビルドしています...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('ビルドが完了しました');
    return true;
  } catch (error) {
    console.error('ビルド中にエラーが発生しました:', error);
    return false;
  }
}

// 再起動スクリプトの内容
const restartScript = `#!/bin/bash
cd /home/irutomokrserver/node-apps/irutomo-nextjs
npm install --production
pm2 delete irutomo-nextjs 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo "Next.jsアプリケーションが再起動されました"
`;

// .htaccessファイルの内容
const htaccessContent = fs.readFileSync(path.join(__dirname, 'node-htaccess', '.htaccess'), 'utf8');

// FTPを使用してファイルをアップロード
async function deployToFtp() {
  // まずビルドを実行
  if (!buildProject()) {
    console.error('ビルドに失敗したため、デプロイを中止します');
    return;
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('FTPサーバーに接続しています...');
    await client.access(config);
    
    console.log('接続成功！ファイルをアップロードしています...');
    
    // リモートディレクトリを確認、なければ作成
    console.log(`リモートディレクトリを確認・作成: ${remoteNodeDir}`);
    try {
      // ディレクトリ階層を作成
      const dirParts = remoteNodeDir.split('/').filter(Boolean);
      let currentPath = '/';
      
      for (const part of dirParts) {
        currentPath = `${currentPath}${part}/`;
        try {
          await client.ensureDir(currentPath);
        } catch (err) {
          console.log(`ディレクトリ作成試行: ${currentPath}`);
          try {
            await client.mkdir(currentPath);
          } catch (mkdirErr) {
            console.log(`既存ディレクトリを使用: ${currentPath}`);
          }
          await client.cd(currentPath);
        }
      }
    } catch (err) {
      console.log(`リモートディレクトリの確認中にエラーが発生しました: ${err.message}`);
      console.log('既存のディレクトリを使用します...');
    }
    
    // ホームディレクトリに.htaccessファイルをアップロード
    console.log('Node.js用.htaccessファイルをアップロードしています...');
    try {
      await client.cd('/');
      fs.writeFileSync('temp_htaccess', htaccessContent);
      await client.uploadFrom('temp_htaccess', '/.htaccess');
      fs.unlinkSync('temp_htaccess');
    } catch (err) {
      console.error(`htaccessアップロード中にエラー: ${err.message}`);
    }

    // PM2設定ファイルを作成してアップロード
    fs.writeFileSync('ecosystem.config.js', pm2Config);
    console.log('PM2設定ファイルをアップロードしています...');
    await client.uploadFrom('ecosystem.config.js', `${remoteNodeDir}ecosystem.config.js`);
    
    // 再起動スクリプトを作成してアップロード
    fs.writeFileSync('restart-nextjs.sh', restartScript);
    console.log('再起動スクリプトをアップロードしています...');
    await client.uploadFrom('restart-nextjs.sh', `${remoteNodeDir}restart-nextjs.sh`);
    
    // .nextディレクトリをアップロード
    console.log('.nextディレクトリをアップロードしています...');
    await client.uploadFromDir('.next', `${remoteNodeDir}.next`);
    
    // 指定されたファイルをアップロード
    for (const file of filesToUpload) {
      if (fs.existsSync(file)) {
        console.log(`${file}をアップロードしています...`);
        await client.uploadFrom(file, `${remoteNodeDir}${file}`);
      } else {
        console.log(`警告: ${file}が見つかりません。スキップします。`);
      }
    }
    
    // 指定されたディレクトリをアップロード
    for (const dir of dirsToUpload) {
      if (fs.existsSync(dir)) {
        console.log(`${dir}ディレクトリをアップロードしています...`);
        await client.uploadFromDir(dir, `${remoteNodeDir}${dir}`);
      } else {
        console.log(`警告: ${dir}ディレクトリが見つかりません。スキップします。`);
      }
    }
    
    console.log('デプロイが完了しました！');
    console.log('');
    console.log('アプリケーションを起動するには、以下のコマンドをサーバー上で実行してください:');
    console.log('cd /home/irutomokrserver/node-apps/irutomo-nextjs');
    console.log('bash restart-nextjs.sh');

  } catch (err) {
    console.error(`デプロイ中にエラーが発生しました: ${err.message}`);
  } finally {
    client.close();
    
    // 一時ファイルを削除
    if (fs.existsSync('ecosystem.config.js')) {
      fs.unlinkSync('ecosystem.config.js');
    }
    if (fs.existsSync('restart-nextjs.sh')) {
      fs.unlinkSync('restart-nextjs.sh');
    }
  }
}

// スクリプト実行
deployToFtp(); 