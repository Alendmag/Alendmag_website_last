<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    $row = db()->query('SELECT COUNT(*) as count FROM products')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $where = [];
    $params = [];

    if (isset($_GET['active']) && $_GET['active'] !== '') {
        $where[] = 'is_active = ?';
        $params[] = (int)$_GET['active'];
    }
    $sql = 'SELECT * FROM products';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY created_at DESC';
    if (isset($_GET['limit'])) {
        $sql .= ' LIMIT ' . (int)$_GET['limit'];
    }
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    json_ok($rows);
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO products (id, name_ar, name_en, description_ar, description_en, price, category, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['name_ar'] ?? '',
        $b['name_en'] ?? '',
        $b['description_ar'] ?? null,
        $b['description_en'] ?? null,
        $b['price'] ?? 0,
        $b['category'] ?? '',
        $b['image_url'] ?? null,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
    ]);
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
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
    $allowed = ['name_ar','name_en','description_ar','description_en','price','category','image_url','is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM products WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
