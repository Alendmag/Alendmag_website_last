<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

set_cors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');

session_name(SESSION_NAME);
session_set_cookie_params([
    'lifetime' => SESSION_LIFETIME,
    'path'     => '/',
    'secure'   => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$method  = strtoupper($_SERVER['REQUEST_METHOD']);
$rawPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$base = '/api';
if (str_starts_with($rawPath, $base)) {
    $rawPath = substr($rawPath, strlen($base));
}
$path = '/' . trim($rawPath, '/');

$segments = array_values(array_filter(explode('/', ltrim($path, '/'))));
$resource = $segments[0] ?? '';

$GLOBALS['_ROUTE'] = [
    'method'   => $method,
    'path'     => $path,
    'segments' => $segments,
    'id'       => $segments[1] ?? null,
    'sub'      => $segments[2] ?? null,
];

$routeMap = [
    'auth'             => 'auth',
    'products'         => 'products',
    'orders'           => 'orders',
    'clients'          => 'clients',
    'projects'         => 'projects',
    'project_tasks'    => 'project_tasks',
    'team_members'     => 'team_members',
    'blog_posts'       => 'blog_posts',
    'testimonials'     => 'testimonials',
    'faq'              => 'faq',
    'contact_messages' => 'contact_messages',
    'support_tickets'  => 'support_tickets',
    'ticket_replies'   => 'ticket_replies',
    'support_videos'   => 'support_videos',
    'site_settings'    => 'site_settings',
    'upload'           => 'upload',
    'dashboard_stats'  => 'dashboard_stats',
];

if (isset($routeMap[$resource])) {
    $file = __DIR__ . '/routes/' . $routeMap[$resource] . '.php';
    if (file_exists($file)) {
        require $file;
        exit;
    }
}

json_err('Not Found', 404);
