<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'login' && $r['method'] === 'POST') {
    $b = body();
    $username = trim($b['username'] ?? '');
    $password = $b['password'] ?? '';

    if (!$username || !$password) {
        json_err('Username and password are required', 400);
    }

    $stmt = db()->prepare(
        'SELECT id, name_ar, name_en, username, password_hash, is_admin, is_active
         FROM team_members WHERE username = ? AND is_admin = 1 LIMIT 1'
    );
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !$admin['is_active']) {
        json_err('Invalid credentials', 401);
    }

    if (!password_verify($password, $admin['password_hash'])) {
        json_err('Invalid credentials', 401);
    }

    $_SESSION['admin_id']   = $admin['id'];
    $_SESSION['admin_name'] = $admin['name_ar'];
    $_SESSION['is_admin']   = true;

    unset($admin['password_hash']);
    json_ok($admin);
}

if ($r['id'] === 'logout' && $r['method'] === 'POST') {
    session_destroy();
    json_ok(['message' => 'Logged out']);
}

if ($r['id'] === 'check' && $r['method'] === 'GET') {
    if (empty($_SESSION['admin_id'])) {
        json_err('Unauthorized', 401);
    }
    $stmt = db()->prepare(
        'SELECT id, name_ar, name_en, username FROM team_members WHERE id = ? LIMIT 1'
    );
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    if (!$admin) json_err('Unauthorized', 401);
    json_ok($admin);
}

json_err('Not Found', 404);
