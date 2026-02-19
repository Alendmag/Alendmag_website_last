<?php
$r = $GLOBALS['_ROUTE'];

if (!$r['id'] && $r['method'] === 'GET') {
    require_auth();
    if (empty($_GET['project_id'])) json_err('project_id required', 400);
    $stmt = db()->prepare(
        'SELECT t.*, tm.name_ar as assignee_name FROM project_tasks t
         LEFT JOIN team_members tm ON tm.id = t.assigned_to
         WHERE t.project_id = ? ORDER BY t.created_at ASC'
    );
    $stmt->execute([$_GET['project_id']]);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    require_auth();
    $b = body();
    $id = uuid();
    db()->prepare(
        'INSERT INTO project_tasks (id, project_id, title, description, status, assigned_to, priority, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['project_id'] ?? '',
        $b['title'] ?? '',
        $b['description'] ?? null,
        $b['status'] ?? 'pending',
        $b['assigned_to'] ?? null,
        $b['priority'] ?? 'medium',
        $b['due_date'] ?? null,
    ]);
    $stmt = db()->prepare('SELECT * FROM project_tasks WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->prepare('SELECT * FROM project_tasks WHERE id = ?');
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
    $allowed = ['title','description','status','assigned_to','priority','due_date'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE project_tasks SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM project_tasks WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM project_tasks WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
