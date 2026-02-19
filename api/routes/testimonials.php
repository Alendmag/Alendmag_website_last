<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    $row = db()->query('SELECT COUNT(*) as count FROM testimonials WHERE is_active = 1')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $isAuth = !empty($_SESSION['admin_id']);
    $sql = 'SELECT * FROM testimonials';
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
        'INSERT INTO testimonials (id, client_name, client_position, client_company, client_photo, content_ar, content_en, rating, is_featured, is_active, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['client_name'] ?? '',
        $b['client_position'] ?? null,
        $b['client_company'] ?? null,
        $b['client_photo'] ?? null,
        $b['content_ar'] ?? '',
        $b['content_en'] ?? '',
        $b['rating'] ?? 5,
        isset($b['is_featured']) ? (int)$b['is_featured'] : 0,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
        $b['order_index'] ?? 0,
    ]);
    $stmt = db()->prepare('SELECT * FROM testimonials WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT * FROM testimonials WHERE id = ?');
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
    $allowed = ['client_name','client_position','client_company','client_photo','content_ar','content_en','rating','is_featured','is_active','order_index'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE testimonials SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM testimonials WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM testimonials WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
