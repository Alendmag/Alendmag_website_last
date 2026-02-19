<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query('SELECT COUNT(*) as count FROM contact_messages WHERE is_archived = 0')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    require_auth();
    $where = [];
    $params = [];
    $archived = isset($_GET['archived']) ? (int)$_GET['archived'] : 0;
    $where[] = 'is_archived = ?';
    $params[] = $archived;

    $count_sql = 'SELECT COUNT(*) as c FROM contact_messages WHERE ' . implode(' AND ', $where);
    $cs = db()->prepare($count_sql);
    $cs->execute($params);
    $total = (int)$cs->fetch()['c'];

    $sql = 'SELECT * FROM contact_messages WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY created_at DESC';
    $limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $sql .= " LIMIT $limit OFFSET $offset";

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_ok(['data' => $stmt->fetchAll(), 'total' => $total]);
}

if (!$r['id'] && $r['method'] === 'POST') {
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO contact_messages (id, name, email, phone, subject, message)
         VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['name'] ?? '',
        $b['email'] ?? '',
        $b['phone'] ?? null,
        $b['subject'] ?? null,
        $b['message'] ?? '',
    ]);
    $stmt = db()->prepare('SELECT * FROM contact_messages WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->prepare('SELECT * FROM contact_messages WHERE id = ?');
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
    $allowed = ['is_read','is_archived','replied_at','notes'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE contact_messages SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM contact_messages WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
