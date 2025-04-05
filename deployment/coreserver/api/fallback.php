<?php
/**
 * API用フォールバックファイル
 * 静的ホスティングではAPI処理できないため、アプリケーションエラーを最小限にとどめるためのフォールバック
 */

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