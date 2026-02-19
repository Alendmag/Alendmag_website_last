<?php
$r = $GLOBALS['_ROUTE'];

if (!$r['id'] && $r['method'] === 'GET') {
    $isAuth = !empty($_SESSION['admin_id']);
    $sql = 'SELECT * FROM support_videos';
    if (!$isAuth) $sql .= ' WHERE is_active = 1';
    $sql .= ' ORDER BY order_index ASC, created_at DESC';
    $stmt = db()->query($sql);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO support_videos (id, title_ar, title_en, description_ar, description_en, youtube_url, category, order_index, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['title_ar'] ?? '',
        $b['title_en'] ?? '',
        $b['description_ar'] ?? null,
        $b['description_en'] ?? null,
        $b['youtube_url'] ?? '',
        $b['category'] ?? 'general',
        $b['order_index'] ?? 0,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
    ]);
    $stmt = db()->prepare('SELECT * FROM support_videos WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT * FROM support_videos WHERE id = ?');
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
    $allowed = ['title_ar','title_en','description_ar','description_en','youtube_url','category','order_index','is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE support_videos SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM support_videos WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM support_videos WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
