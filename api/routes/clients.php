<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query('SELECT COUNT(*) as count FROM clients')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->query('SELECT * FROM clients ORDER BY created_at DESC');
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO clients (id, name, email, phone, company, logo_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['name'] ?? '',
        $b['email'] ?? '',
        $b['phone'] ?? null,
        $b['company'] ?? null,
        $b['logo_url'] ?? null,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
    ]);
    $stmt = db()->prepare('SELECT * FROM clients WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->prepare('SELECT * FROM clients WHERE id = ?');
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
    $allowed = ['name','email','phone','company','logo_url','is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE clients SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM clients WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM clients WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
