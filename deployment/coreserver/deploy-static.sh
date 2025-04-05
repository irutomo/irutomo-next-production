#!/bin/bash
# IRUTOMOアプリケーション静的ページデプロイスクリプト

# エラーが発生したら停止する
set -e

echo "IRUTOMOアプリケーションの静的ページデプロイを開始します..."

# カレントディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 出力ディレクトリの設定
OUTPUT_DIR="$SCRIPT_DIR/out"

# 出力ディレクトリをクリーンアップ
echo "出力ディレクトリをクリーンアップします..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# API用ファイルの準備
echo "API用ファイルを準備しています..."
mkdir -p "$OUTPUT_DIR/api"

# API用のフォールバックPHPファイルを作成
cat > "$OUTPUT_DIR/api/fallback.php" << 'EOL'
<?php
// 静的サイト用APIフォールバックハンドラー

// CORSヘッダーを設定
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");

// OPTIONSリクエストを処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// クライアントからのリクエストを解析
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// APIパスを解析
$apiPath = str_replace('/api/', '', $requestUri);
$pathParts = explode('/', $apiPath);

// レスポンス設定
header('Content-Type: application/json');

// リクエスト情報をログに記録
error_log("API Request: $requestMethod $requestUri");

// エンドポイントごとの処理
if (strpos($requestUri, '/api/auth/supabase-token') === 0) {
    // Supabaseトークン取得API
    echo json_encode([
        'error' => '静的ホスティングでは利用できません。サーバーサイド機能が必要です。',
        'message' => 'この機能は静的サイトからはリダイレクトする必要があります。',
        'redirect' => true,
        'redirectUrl' => 'https://irutomo-trip.com/auth/error?reason=static_hosting'
    ]);
} elseif (strpos($requestUri, '/api/webhook/clerk') === 0) {
    // Clerkウェブフック
    echo json_encode([
        'success' => false,
        'message' => 'この機能は静的ホスティングでは利用できません。',
        'webhookReceived' => true
    ]);
} elseif (strpos($requestUri, '/api/paypal/webhook') === 0) {
    // PayPalウェブフック
    echo json_encode([
        'success' => false, 
        'message' => 'PayPalウェブフックを受信しましたが、静的ホスティングでは処理できません。',
        'webhookReceived' => true
    ]);
} else {
    // 未知のAPIエンドポイント
    http_response_code(404);
    echo json_encode([
        'error' => 'Not Found',
        'message' => 'リクエストされたAPIエンドポイントは存在しないか、静的ホスティングでは利用できません。',
        'requestedEndpoint' => $requestUri
    ]);
}
EOL

# .htaccessをコピー
echo ".htaccessファイルをコピーしています..."
cp "$SCRIPT_DIR/.htaccess" "$OUTPUT_DIR/"

# 静的アセットのみ生成（ビルドをスキップ）
echo "静的ファイルを手動で生成します..."

# 基本的なHTMLファイルを作成
echo "基本的なHTMLファイルを作成しています..."
cat > "$OUTPUT_DIR/index.html" << 'EOL'
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="イルトモは韓国料理の美味しいお店を予約できるサービスです。言葉の壁を超えて本場の韓国グルメを楽しもう！">
    <title>イルトモ - 韓国グルメ予約サービス</title>
    <style>
        body { 
            font-family: 'Noto Sans JP', sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: white;
            color: #333;
            line-height: 1.6;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem; 
        }
        header {
            text-align: center;
            margin-bottom: 2rem;
        }
        h1 { 
            color: #f97316; 
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        h2 {
            color: #666;
            font-weight: normal;
            font-size: 1.2rem;
            margin-top: 0;
        }
        .message { 
            background: #fff7ed; 
            border: 1px solid #ffedd5; 
            padding: 2rem; 
            border-radius: 0.5rem;
            margin-bottom: 2rem;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .feature {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .feature h3 {
            color: #f97316;
            margin-top: 0;
        }
        footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>イルトモ</h1>
            <h2>韓国グルメ予約サービス</h2>
        </header>
        
        <div class="message">
            <h3>メンテナンスのお知らせ</h3>
            <p>現在サイトをメンテナンス中です。近日中に新しいバージョンでご利用いただけます。</p>
            <p>ご不便をおかけして申し訳ありません。</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>簡単予約</h3>
                <p>言葉の壁を気にせず、本場の韓国料理店を簡単に予約できます。</p>
            </div>
            <div class="feature">
                <h3>多彩なレストラン</h3>
                <p>ソウルの人気店から隠れた名店まで、選りすぐりのレストランをご紹介。</p>
            </div>
            <div class="feature">
                <h3>安心サポート</h3>
                <p>予約から決済まで、サービスがあなたの韓国グルメ体験をサポートします。</p>
            </div>
        </div>
        
        <footer>
            <p>&copy; 2025 イルトモ - 韓国グルメ予約サービス</p>
        </footer>
    </div>
</body>
</html>
EOL

# 404ページの作成
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/404.html"

# その他の必要なページを作成
echo "各種ページを作成しています..."

# レストラン関連ページ
mkdir -p "$OUTPUT_DIR/restaurants"
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/restaurants/index.html"

# 認証関連ページ
mkdir -p "$OUTPUT_DIR/auth"
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/auth/index.html"
mkdir -p "$OUTPUT_DIR/auth/sign-in"
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/auth/sign-in/index.html"
mkdir -p "$OUTPUT_DIR/auth/sign-up"
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/auth/sign-up/index.html"

# 予約関連ページ
mkdir -p "$OUTPUT_DIR/reservation"
cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/reservation/index.html"

# 静的アセットディレクトリ作成
echo "静的アセットディレクトリを作成しています..."
mkdir -p "$OUTPUT_DIR/_next/static/css"
mkdir -p "$OUTPUT_DIR/_next/static/images"
mkdir -p "$OUTPUT_DIR/_next/static/media"
mkdir -p "$OUTPUT_DIR/_next/static/chunks"

# 空のCSSファイルを作成
touch "$OUTPUT_DIR/_next/static/css/main.css"

# faviconの作成
echo "faviconを作成しています..."
mkdir -p "$OUTPUT_DIR/public"
cat > "$OUTPUT_DIR/favicon.ico" << 'EOL'
<!-- 空のfavicon -->
EOL

echo "静的ファイルの生成が完了しました"

# 完了メッセージ
echo "デプロイ準備が完了しました。"
echo "コアサーバーにアップロードするには、以下のフォルダの内容をすべてアップロードしてください:"
echo "$OUTPUT_DIR"

echo "デプロイプロセスが完了しました。" 