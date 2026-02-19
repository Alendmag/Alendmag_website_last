<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query('SELECT COUNT(*) as count FROM orders')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    require_auth();
    $where = [];
    $params = [];

    if (!empty($_GET['status'])) {
        $where[] = 'o.status = ?';
        $params[] = $_GET['status'];
    }

    $total_sql = 'SELECT COUNT(*) as c FROM orders o' . ($where ? ' WHERE ' . implode(' AND ', $where) : '');
    $total_stmt = db()->prepare($total_sql);
    $total_stmt->execute($params);
    $total = (int)$total_stmt->fetch()['c'];

    $sql = 'SELECT o.*, p.name_ar as product_name_ar, p.name_en as product_name_en
            FROM orders o LEFT JOIN products p ON p.id = o.product_id';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY o.created_at DESC';

    $limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $sql .= " LIMIT $limit OFFSET $offset";

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        if ($row['product_name_ar']) {
            $row['products'] = [
                'name_ar' => $row['product_name_ar'],
                'name_en' => $row['product_name_en'],
            ];
        }
        unset($row['product_name_ar'], $row['product_name_en']);
    }
    json_ok(['data' => $rows, 'total' => $total]);
}

if (!$r['id'] && $r['method'] === 'POST') {
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO orders (id, customer_name, customer_email, customer_phone, product_id, quantity, total_amount, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['customer_name'] ?? '',
        $b['customer_email'] ?? '',
        $b['customer_phone'] ?? '',
        $b['product_id'] ?? null,
        $b['quantity'] ?? 1,
        $b['total_amount'] ?? 0,
        $b['status'] ?? 'pending',
        $b['notes'] ?? null,
    ]);
    $stmt = db()->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->prepare('SELECT * FROM orders WHERE id = ?');
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
    $allowed = ['status','notes','customer_name','customer_email','customer_phone','quantity','total_amount'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE orders SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM orders WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
