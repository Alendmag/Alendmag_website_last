<?php
$r = $GLOBALS['_ROUTE'];

if (!$r['id'] && $r['method'] === 'GET') {
    $where = [];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = 'category = ?';
        $params[] = $_GET['category'];
    }
    if (!empty($_GET['key'])) {
        $where[] = 'setting_key = ?';
        $params[] = $_GET['key'];

        $sql = 'SELECT * FROM site_settings';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' LIMIT 1';
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        json_ok($row ?: null);
    }

    $sql = 'SELECT * FROM site_settings';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY category ASC, order_index ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    if (isset($b[0])) {
        $updated = [];
        foreach ($b as $item) {
            if (!empty($item['id'])) {
                db()->prepare('UPDATE site_settings SET setting_value = ? WHERE id = ?')
                    ->execute([$item['setting_value'] ?? '', $item['id']]);
                $updated[] = $item['id'];
            } elseif (!empty($item['setting_key'])) {
                $stmt = db()->prepare('SELECT id FROM site_settings WHERE setting_key = ?');
                $stmt->execute([$item['setting_key']]);
                $existing = $stmt->fetch();
                if ($existing) {
                    db()->prepare('UPDATE site_settings SET setting_value = ? WHERE id = ?')
                        ->execute([$item['setting_value'] ?? '', $existing['id']]);
                } else {
                    $id = uuid();
                    db()->prepare(
                        'INSERT INTO site_settings (id, category, setting_key, setting_value, setting_type, label_ar, label_en)
                         VALUES (?, ?, ?, ?, ?, ?, ?)'
                    )->execute([
                        $id,
                        $item['category'] ?? 'general',
                        $item['setting_key'],
                        $item['setting_value'] ?? '',
                        $item['setting_type'] ?? 'text',
                        $item['label_ar'] ?? null,
                        $item['label_en'] ?? null,
                    ]);
                }
            }
        }
        json_ok(['updated' => count($updated)]);
    }

    $id = uuid();
    db()->prepare(
        'INSERT INTO site_settings (id, category, setting_key, setting_value, setting_type, label_ar, label_en, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['category'] ?? 'general',
        $b['setting_key'] ?? '',
        $b['setting_value'] ?? null,
        $b['setting_type'] ?? 'text',
        $b['label_ar'] ?? null,
        $b['label_en'] ?? null,
        $b['order_index'] ?? 0,
    ]);
    $stmt = db()->prepare('SELECT * FROM site_settings WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if (!$r['id'] && $r['method'] === 'PUT') {
    require_auth();
    $b = body();
    if (!is_array($b) || !isset($b[0])) json_err('Array required for bulk update', 400);
    foreach ($b as $item) {
        if (!empty($item['setting_key'])) {
            db()->prepare(
                'INSERT INTO site_settings (id, category, setting_key, setting_value, setting_type, label_ar, label_en)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
            )->execute([
                uuid(),
                $item['category'] ?? 'general',
                $item['setting_key'],
                $item['setting_value'] ?? '',
                $item['setting_type'] ?? 'text',
                $item['label_ar'] ?? null,
                $item['label_en'] ?? null,
            ]);
        }
    }
    json_ok(['updated' => count($b)]);
}

if ($r['id'] && $r['method'] === 'PUT') {
    require_auth();
    $b = body();
    $fields = [];
    $params = [];
    $allowed = ['setting_value','setting_type','label_ar','label_en','order_index','category'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE site_settings SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM site_settings WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM site_settings WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
