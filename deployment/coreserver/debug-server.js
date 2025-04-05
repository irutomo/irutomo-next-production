const { Client } = require('basic-ftp');
const fs = require('fs');

// FTP接続情報
const config = {
  host: 'v2007.coreserver.jp',
  user: 'irutomokrserver',
  password: 'TH8s4Zpy9q36',
  secure: false,
  port: 21
};

// デバッグコマンド
const debugScript = `#!/bin/bash
cd /home/irutomokrserver/node-apps/irutomo-nextjs
echo "=== プロセスの確認 ==="
ps aux | grep node
echo ""
echo "=== PM2の状態 ==="
pm2 list
echo ""
echo "=== ログの確認 ==="
pm2 logs --lines 20 irutomo-nextjs
echo ""
echo "=== 再起動を試みます ==="
npm install --production
pm2 delete irutomo-nextjs 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "再起動が完了しました"
`;

async function debugServer() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('FTPサーバーに接続しています...');
    await client.access(config);
    
    console.log('接続成功！デバッグスクリプトをアップロードしています...');
    
    // デバッグスクリプトを作成
    fs.writeFileSync('debug-nextjs.sh', debugScript);
    
    // スクリプトをアップロード
    await client.uploadFrom('debug-nextjs.sh', '/home/irutomokrserver/node-apps/debug-nextjs.sh');
    console.log('デバッグスクリプトのアップロードが完了しました');
    
    // 実行権限を設定するコマンドをアップロード
    const chmodScript = `chmod +x /home/irutomokrserver/node-apps/debug-nextjs.sh`;
    fs.writeFileSync('chmod-debug.sh', chmodScript);
    await client.uploadFrom('chmod-debug.sh', '/home/irutomokrserver/chmod-debug.sh');
    
    console.log('デバッグ準備が完了しました！');
    console.log('');
    console.log('サーバー上で以下のコマンドを実行してデバッグしてください:');
    console.log('1. コアサーバーのSSHに接続');
    console.log('2. 以下のコマンドを実行:');
    console.log('   sh /home/irutomokrserver/chmod-debug.sh');
    console.log('   sh /home/irutomokrserver/node-apps/debug-nextjs.sh');

  } catch (err) {
    console.error(`エラーが発生しました: ${err.message}`);
  } finally {
    client.close();
    
    // 一時ファイルを削除
    if (fs.existsSync('debug-nextjs.sh')) {
      fs.unlinkSync('debug-nextjs.sh');
    }
    if (fs.existsSync('chmod-debug.sh')) {
      fs.unlinkSync('chmod-debug.sh');
    }
  }
}

// スクリプト実行
debugServer(); 