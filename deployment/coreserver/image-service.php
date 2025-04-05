<?php
/**
 * 画像サービスAPI
 * 
 * このスクリプトは以下の機能を提供します：
 * 1. 画像のアップロード処理
 * 2. 画像の取得・配信
 * 3. 画像のリサイズ（オプション）
 */

// CORSヘッダー設定
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // プリフライトリクエストには200を返すだけ
    header('HTTP/1.1 200 OK');
    exit();
}

// 設定
$config = [
    'upload_dir' => 'images/restaurants/',
    'allowed_types' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    'max_file_size' => 5 * 1024 * 1024, // 5MB
    'base_url' => 'https://irutomo-trip.com/',
];

// エラーログ設定
ini_set('log_errors', 1);
ini_set('error_log', 'image-service-errors.log');

// リクエストタイプに応じた処理
$action = isset($_GET['action']) ? $_GET['action'] : 'view';

switch ($action) {
    case 'upload':
        handleUpload($config);
        break;
    case 'view':
        handleView($config);
        break;
    default:
        sendResponse(['error' => 'Invalid action'], 400);
}

/**
 * 画像アップロード処理
 */
function handleUpload($config) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(['error' => 'Method not allowed'], 405);
        return;
    }

    // アップロードディレクトリの確認
    if (!file_exists($config['upload_dir'])) {
        if (!mkdir($config['upload_dir'], 0755, true)) {
            sendResponse(['error' => 'Failed to create upload directory'], 500);
            return;
        }
    }

    // ファイルのチェック
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $error = isset($_FILES['image']) ? getUploadErrorMessage($_FILES['image']['error']) : 'No file uploaded';
        sendResponse(['error' => $error], 400);
        return;
    }

    $file = $_FILES['image'];

    // MIMEタイプのチェック
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $config['allowed_types'])) {
        sendResponse(['error' => 'File type not allowed'], 400);
        return;
    }

    // ファイルサイズのチェック
    if ($file['size'] > $config['max_file_size']) {
        sendResponse(['error' => 'File is too large'], 400);
        return;
    }

    // ファイル名の生成
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $restaurantId = isset($_POST['restaurantId']) ? $_POST['restaurantId'] : '';
    $imageIndex = isset($_POST['imageIndex']) ? $_POST['imageIndex'] : 'main';
    
    if (!empty($restaurantId)) {
        $newFilename = "restaurant_{$restaurantId}_{$imageIndex}.{$extension}";
    } else {
        $newFilename = uniqid() . '_' . time() . ".{$extension}";
    }
    
    $uploadPath = $config['upload_dir'] . $newFilename;

    // ファイル移動
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendResponse(['error' => 'Failed to save file'], 500);
        return;
    }

    // 成功レスポンス
    $imageUrl = $config['base_url'] . $uploadPath;
    sendResponse([
        'success' => true,
        'url' => $imageUrl,
        'filename' => $newFilename,
    ]);
}

/**
 * 画像表示処理
 */
function handleView($config) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendResponse(['error' => 'Method not allowed'], 405);
        return;
    }

    $filename = isset($_GET['file']) ? $_GET['file'] : '';
    if (empty($filename)) {
        sendResponse(['error' => 'No filename specified'], 400);
        return;
    }

    // パストラバーサル対策
    $filename = basename($filename);
    $filepath = $config['upload_dir'] . $filename;

    if (!file_exists($filepath)) {
        sendResponse(['error' => 'File not found'], 404);
        return;
    }

    // MIMEタイプの取得
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($filepath);

    // 画像のレスポンス
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($filepath));
    header('Cache-Control: public, max-age=31536000'); // 1年間キャッシュ
    readfile($filepath);
    exit;
}

/**
 * JSONレスポンスを送信
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * アップロードエラーのメッセージ取得
 */
function getUploadErrorMessage($error) {
    switch ($error) {
        case UPLOAD_ERR_INI_SIZE:
            return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
        case UPLOAD_ERR_FORM_SIZE:
            return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form';
        case UPLOAD_ERR_PARTIAL:
            return 'The uploaded file was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing a temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'A PHP extension stopped the file upload';
        default:
            return 'Unknown upload error';
    }
}