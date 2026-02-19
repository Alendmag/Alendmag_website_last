<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query('SELECT COUNT(*) as count FROM team_members WHERE is_admin = 0')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $isAuth = !empty($_SESSION['admin_id']);
    $sql = 'SELECT id, name_ar, name_en, position_ar, position_en, photo_url, image_url, bio_ar, bio_en, order_index, is_active, is_admin, created_at FROM team_members';
    if (!$isAuth) {
        $sql .= ' WHERE is_active = 1';
    }
    $sql .= ' ORDER BY order_index ASC, created_at ASC';
    $stmt = db()->query($sql);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    $passwordHash = null;
    if (!empty($b['password'])) {
        $passwordHash = password_hash($b['password'], PASSWORD_BCRYPT);
    }
    db()->prepare(
        'INSERT INTO team_members (id, name_ar, name_en, position_ar, position_en, photo_url, image_url, bio_ar, bio_en, order_index, is_active, is_admin, username, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['name_ar'] ?? '',
        $b['name_en'] ?? '',
        $b['position_ar'] ?? '',
        $b['position_en'] ?? '',
        $b['photo_url'] ?? null,
        $b['image_url'] ?? null,
        $b['bio_ar'] ?? null,
        $b['bio_en'] ?? null,
        $b['order_index'] ?? 0,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
        isset($b['is_admin']) ? (int)$b['is_admin'] : 0,
        $b['username'] ?? null,
        $passwordHash,
    ]);
    $stmt = db()->prepare('SELECT id, name_ar, name_en, position_ar, position_en, photo_url, image_url, bio_ar, bio_en, order_index, is_active, is_admin, created_at FROM team_members WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT id, name_ar, name_en, position_ar, position_en, photo_url, image_url, bio_ar, bio_en, order_index, is_active, is_admin, created_at FROM team_members WHERE id = ?');
    $stmt->execute([$r['id']]);
    $row = $stmt->fetch();
    if (!$row) json_err('Not found', 404);
    json_ok($row);
}

if ($r['id'] && $r['method'] === 'PUT') {
    require_auth();
    $b = body();
    $fields = [];
    $params = [];
    $allowed = ['name_ar','name_en','position_ar','position_en','photo_url','image_url','bio_ar','bio_en','order_index','is_active','is_admin','username'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!empty($b['password'])) {
        $fields[] = 'password_hash = ?';
        $params[] = password_hash($b['password'], PASSWORD_BCRYPT);
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE team_members SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT id, name_ar, name_en, position_ar, position_en, photo_url, image_url, bio_ar, bio_en, order_index, is_active, is_admin, created_at FROM team_members WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM team_members WHERE id = ? AND is_admin = 0')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
