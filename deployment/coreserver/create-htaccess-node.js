const fs = require('fs');
const path = require('path');

// Node.jsアプリケーション用の.htaccessファイル内容
const htaccessContent = `# Next.js Node.jsアプリケーション用.htaccess
# リバースプロキシ設定を有効化
RewriteEngine On

# 環境変数の設定
SetEnv NEXT_PUBLIC_SUPABASE_URL "https://qgqebyunvamzfaaaypmd.supabase.co"
SetEnv NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWFhcG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA0ODQyNTQsImV4cCI6MjAyNjA2MDI1NH0.bq2x4kkKZGjOZXVQV9n9Yw7i5CKydPrK4IA0b64pKQE"
SetEnv NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "pk_test_ZGlzdGluY3QtZHVuZmxseS05Mi5jbGVyay5hY2NvdW50cy5kZXYk"
SetEnv PAYPAL_CLIENT_ID "AX__ZB3M5gT4CkuFI9T8bXoyZYZPqsvVu7JilzrpPg2rzkOPqJ1kh8WbPdeFEVwp9lS4NzQDzfF_SSqv"
SetEnv NEXT_PUBLIC_REDIRECT_URL "https://irutomo-trip.com/auth/callback"

# MIMEタイプの定義
AddType application/javascript .js
AddType application/json .json
AddType text/css .css
AddType image/svg+xml .svg
AddType image/x-icon .ico
AddType application/font-woff .woff
AddType application/font-woff2 .woff2

# ブラウザキャッシュの設定
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 month"
    ExpiresByType font/woff "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 month"
    ExpiresByType application/font-woff "access plus 1 month"
    ExpiresByType application/font-woff2 "access plus 1 month"
    ExpiresByType video/mp4 "access plus 1 month"
    ExpiresByType video/webm "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType application/json "access plus 1 week"
</IfModule>

# 静的ファイルへのリクエストはそのままドキュメントルートから提供
RewriteCond %{REQUEST_URI} ^/_next/static/(.*)$
RewriteRule ^/_next/static/(.*)$ /public_html/_next/static/$1 [L]

RewriteCond %{REQUEST_URI} ^/images/(.*)$
RewriteRule ^/images/(.*)$ /public_html/images/$1 [L]

RewriteCond %{REQUEST_URI} ^/favicon.ico$
RewriteRule ^/favicon.ico$ /public_html/favicon.ico [L]

# 残りのすべてのリクエストはNode.jsアプリにプロキシ
RewriteRule ^(.*)$ http://localhost:3000$1 [P,L]

# プロキシの設定
<IfModule mod_proxy.c>
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</IfModule>

# HTTPSリダイレクト
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# セキュリティヘッダー
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>

# クロスオリジンリソース共有(CORS)
<IfModule mod_headers.c>
    <FilesMatch "\.(ttf|ttc|otf|eot|woff|woff2|font.css|css|js|json)$">
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>

# サーバーシグネチャを非表示
ServerSignature Off

# ディレクトリインデックス表示の無効化
Options -Indexes
`;

// .htaccessファイルの保存先
const htaccessPath = path.join(__dirname, 'node-htaccess');
const htaccessFileName = '.htaccess';

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(htaccessPath)) {
  fs.mkdirSync(htaccessPath, { recursive: true });
}

// .htaccessファイルを作成
fs.writeFileSync(path.join(htaccessPath, htaccessFileName), htaccessContent);

console.log(`.htaccessファイルを作成しました: ${path.join(htaccessPath, htaccessFileName)}`);
console.log('このファイルをコアサーバーのルートディレクトリにアップロードしてください。'); 