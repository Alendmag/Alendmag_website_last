<?php
require_auth();

$r = $GLOBALS['_ROUTE'];

if ($r['method'] === 'POST') {
    if (empty($_FILES['file'])) {
        json_err('No file uploaded', 400);
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_err('Upload error: ' . $file['error'], 400);
    }

    if ($file['size'] > MAX_UPLOAD_SIZE) {
        json_err('File too large (max 10MB)', 400);
    }

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_TYPES)) {
        json_err('File type not allowed: ' . $mimeType, 400);
    }

    $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['folder'] ?? 'misc');
    $dir    = UPLOAD_DIR . $folder . '/';

    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = bin2hex(random_bytes(12)) . '.' . $ext;
    $dest     = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        json_err('Failed to save file', 500);
    }

    $url = rtrim(
        (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'],
        '/'
    ) . UPLOAD_URL . $folder . '/' . $filename;

    json_ok(['url' => $url]);
}

if ($r['method'] === 'DELETE') {
    if (empty($_GET['url'])) json_err('URL required', 400);

    $url      = $_GET['url'];
    $uploadUrl = rtrim(
        (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'],
        '/'
    ) . UPLOAD_URL;

    if (!str_starts_with($url, $uploadUrl)) {
        json_err('Invalid URL', 400);
    }

    $relativePath = substr($url, strlen($uploadUrl));
    $relativePath = ltrim(preg_replace('/\.\./', '', $relativePath), '/');
    $filePath     = UPLOAD_DIR . $relativePath;

    if (file_exists($filePath)) {
        unlink($filePath);
    }

    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
