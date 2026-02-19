<?php
$r = $GLOBALS['_ROUTE'];

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query('SELECT COUNT(*) as count FROM projects')->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $where = [];
    $params = [];

    if (!empty($_GET['status'])) {
        $where[] = 'p.status = ?';
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['client_id'])) {
        $where[] = 'p.client_id = ?';
        $params[] = $_GET['client_id'];
    }

    $sql = 'SELECT p.*, c.name as client_name, c.company as client_company
            FROM projects p LEFT JOIN clients c ON c.id = p.client_id';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY p.created_at DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        if ($row['technologies']) {
            $row['technologies'] = json_decode($row['technologies'], true) ?? array_filter(explode(',', $row['technologies']));
        } else {
            $row['technologies'] = [];
        }
        if ($row['client_name']) {
            $row['clients'] = ['name' => $row['client_name'], 'company' => $row['client_company']];
        }
        unset($row['client_name'], $row['client_company']);
    }
    json_ok($rows);
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    $tech = isset($b['technologies']) ? json_encode($b['technologies']) : null;
    db()->prepare(
        'INSERT INTO projects (id, title_ar, title_en, description_ar, description_en, client_id, status, progress, start_date, due_date, image_url, technologies, category_ar, category_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['title_ar'] ?? '',
        $b['title_en'] ?? '',
        $b['description_ar'] ?? null,
        $b['description_en'] ?? null,
        $b['client_id'] ?? null,
        $b['status'] ?? 'pending',
        $b['progress'] ?? 0,
        $b['start_date'] ?? null,
        $b['due_date'] ?? null,
        $b['image_url'] ?? null,
        $tech,
        $b['category_ar'] ?? null,
        $b['category_en'] ?? null,
    ]);
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row['technologies']) $row['technologies'] = json_decode($row['technologies'], true) ?? [];
    json_ok($row, 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare(
        'SELECT p.*, c.name as client_name FROM projects p LEFT JOIN clients c ON c.id = p.client_id WHERE p.id = ?'
    );
    $stmt->execute([$r['id']]);
    $row = $stmt->fetch();
    if (!$row) json_err('Not found', 404);
    if ($row['technologies']) $row['technologies'] = json_decode($row['technologies'], true) ?? [];
    if ($row['client_name']) $row['clients'] = ['name' => $row['client_name']];
    unset($row['client_name']);
    json_ok($row);
}

if ($r['id'] && $r['method'] === 'PUT') {
    require_auth();
    $b = body();
    $fields = [];
    $params = [];
    $allowed = ['title_ar','title_en','description_ar','description_en','client_id','status','progress','start_date','due_date','image_url','category_ar','category_en'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (array_key_exists('technologies', $b)) {
        $fields[] = 'technologies = ?';
        $params[] = json_encode($b['technologies']);
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE projects SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = ?');
    $stmt->execute([$r['id']]);
    $row = $stmt->fetch();
    if ($row['technologies']) $row['technologies'] = json_decode($row['technologies'], true) ?? [];
    json_ok($row);
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM projects WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
