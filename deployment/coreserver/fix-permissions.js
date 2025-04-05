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

// 権限修正スクリプト
const permissionsScript = `#!/bin/bash
echo "=== 権限を修正しています ==="
chmod -R 755 /domains/irutomo-trip.com/public_html/
chmod -R 755 /domains/irutomokrserver.v2007.coreserver.jp/public_html/
find /domains/irutomo-trip.com/public_html/ -type f -exec chmod 644 {} \\;
find /domains/irutomokrserver.v2007.coreserver.jp/public_html/ -type f -exec chmod 644 {} \\;
chmod 755 /domains/irutomo-trip.com/public_html/.htaccess
chmod 755 /domains/irutomokrserver.v2007.coreserver.jp/public_html/.htaccess
echo "権限の修正が完了しました"
`;

async function fixPermissions() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('FTPサーバーに接続しています...');
    await client.access(config);
    
    console.log('接続成功！権限修正スクリプトをアップロードしています...');
    
    // 権限修正スクリプトを作成
    fs.writeFileSync('fix-permissions.sh', permissionsScript);
    
    // スクリプトをアップロード
    await client.uploadFrom('fix-permissions.sh', '/home/irutomokrserver/fix-permissions.sh');
    console.log('権限修正スクリプトのアップロードが完了しました');
    
    console.log('');
    console.log('サーバー上で以下のコマンドを実行して権限を修正してください:');
    console.log('1. コアサーバーのSSHに接続');
    console.log('2. 以下のコマンドを実行:');
    console.log('   sh /home/irutomokrserver/fix-permissions.sh');

  } catch (err) {
    console.error(`エラーが発生しました: ${err.message}`);
  } finally {
    client.close();
    
    // 一時ファイルを削除
    if (fs.existsSync('fix-permissions.sh')) {
      fs.unlinkSync('fix-permissions.sh');
    }
  }
}

// スクリプト実行
fixPermissions(); 