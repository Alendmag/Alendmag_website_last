<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    $row = db()->query('SELECT COUNT(*) as count FROM faq WHERE is_active = 1')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $isAuth = !empty($_SESSION['admin_id']);
    $sql = 'SELECT * FROM faq';
    if (!$isAuth) $sql .= ' WHERE is_active = 1';
    $sql .= ' ORDER BY order_index ASC, created_at ASC';
    $stmt = db()->query($sql);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO faq (id, question_ar, question_en, answer_ar, answer_en, category, order_index, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['question_ar'] ?? '',
        $b['question_en'] ?? '',
        $b['answer_ar'] ?? '',
        $b['answer_en'] ?? '',
        $b['category'] ?? 'general',
        $b['order_index'] ?? 0,
        isset($b['is_active']) ? (int)$b['is_active'] : 1,
    ]);
    $stmt = db()->prepare('SELECT * FROM faq WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT * FROM faq WHERE id = ?');
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
    $allowed = ['question_ar','question_en','answer_ar','answer_en','category','order_index','is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE faq SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM faq WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM faq WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
