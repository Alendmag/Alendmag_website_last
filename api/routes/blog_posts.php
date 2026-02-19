<?php
$r = $GLOBALS['_ROUTE'];

$isAuth = !empty($_SESSION['admin_id']);

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    $where = $isAuth ? '' : 'WHERE is_published = 1';
    $row = db()->query("SELECT COUNT(*) as count FROM blog_posts $where")->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if ($r['id'] === 'by-slug' && $r['method'] === 'GET') {
    $slug = urldecode($r['sub'] ?? '');
    if (!$slug) json_err('Slug required', 400);
    $stmt = db()->prepare('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    if (!$row) {
        $stmt = db()->prepare('SELECT * FROM blog_posts WHERE id = ? LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
    }
    if (!$row) json_err('Not found', 404);
    if ($row['tags']) $row['tags'] = json_decode($row['tags'], true) ?? [];
    json_ok($row);
}

if ($r['id'] && preg_match('/^[0-9a-f-]{36}$/', $r['id']) && $r['sub'] === 'views' && $r['method'] === 'POST') {
    db()->prepare('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?')->execute([$r['id']]);
    json_ok(['incremented' => true]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    $where = [];
    $params = [];

    if (!$isAuth) {
        $where[] = 'is_published = 1';
    } elseif (isset($_GET['published'])) {
        $where[] = 'is_published = ?';
        $params[] = (int)$_GET['published'];
    }
    if (!empty($_GET['category'])) {
        $where[] = 'category = ?';
        $params[] = $_GET['category'];
    }

    $count_sql = 'SELECT COUNT(*) as c FROM blog_posts' . ($where ? ' WHERE ' . implode(' AND ', $where) : '');
    $cs = db()->prepare($count_sql);
    $cs->execute($params);
    $total = (int)$cs->fetch()['c'];

    $sql = 'SELECT * FROM blog_posts';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY COALESCE(published_at, created_at) DESC';

    $limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $sql .= " LIMIT $limit OFFSET $offset";

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if ($row['tags']) $row['tags'] = json_decode($row['tags'], true) ?? [];
    }
    json_ok(['data' => $rows, 'total' => $total]);
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id   = uuid();
    $slug = slugify($b['title_en'] ?? $b['title_ar'] ?? $id);

    $stmt = db()->prepare('SELECT COUNT(*) as c FROM blog_posts WHERE slug = ?');
    $stmt->execute([$slug]);
    if ((int)$stmt->fetch()['c'] > 0) {
        $slug .= '-' . substr($id, 0, 8);
    }

    $published_at = null;
    if (!empty($b['is_published'])) $published_at = date('Y-m-d H:i:s');

    db()->prepare(
        'INSERT INTO blog_posts (id, title_ar, title_en, slug, content_ar, content_en, excerpt_ar, excerpt_en, image_url, author_id, category, tags, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['title_ar'] ?? '',
        $b['title_en'] ?? '',
        $slug,
        $b['content_ar'] ?? '',
        $b['content_en'] ?? '',
        $b['excerpt_ar'] ?? null,
        $b['excerpt_en'] ?? null,
        $b['image_url'] ?? null,
        $_SESSION['admin_id'] ?? null,
        $b['category'] ?? 'general',
        isset($b['tags']) ? json_encode($b['tags']) : null,
        isset($b['is_published']) ? (int)$b['is_published'] : 0,
        $published_at,
    ]);
    $stmt = db()->prepare('SELECT * FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row['tags']) $row['tags'] = json_decode($row['tags'], true) ?? [];
    json_ok($row, 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    $stmt = db()->prepare('SELECT * FROM blog_posts WHERE id = ?');
    $stmt->execute([$r['id']]);
    $row = $stmt->fetch();
    if (!$row) json_err('Not found', 404);
    if ($row['tags']) $row['tags'] = json_decode($row['tags'], true) ?? [];
    json_ok($row);
}

if ($r['id'] && $r['method'] === 'PUT') {
    require_auth();
    $b = body();
    $fields = [];
    $params = [];
    $allowed = ['title_ar','title_en','content_ar','content_en','excerpt_ar','excerpt_en','image_url','category','is_published','published_at'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $v = $b[$f];
            if ($f === 'is_published' && $v) {
                $stmt2 = db()->prepare('SELECT published_at FROM blog_posts WHERE id = ?');
                $stmt2->execute([$r['id']]);
                $existing = $stmt2->fetch();
                if (!$existing['published_at']) {
                    $fields[] = 'published_at = ?';
                    $params[] = date('Y-m-d H:i:s');
                }
            }
            $params[] = $v;
        }
    }
    if (array_key_exists('tags', $b)) {
        $fields[] = 'tags = ?';
        $params[] = json_encode($b['tags']);
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM blog_posts WHERE id = ?');
    $stmt->execute([$r['id']]);
    $row = $stmt->fetch();
    if ($row['tags']) $row['tags'] = json_decode($row['tags'], true) ?? [];
    json_ok($row);
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM blog_posts WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
