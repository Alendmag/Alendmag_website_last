<?php
$r = $GLOBALS['_ROUTE'];

function generateTicketNumber(): string {
    $prefix = 'TKT-';
    $date   = date('Ymd');
    $rand   = strtoupper(substr(md5(uniqid()), 0, 5));
    return $prefix . $date . '-' . $rand;
}

if ($r['id'] === 'count' && $r['method'] === 'GET') {
    require_auth();
    $row = db()->query("SELECT COUNT(*) as count FROM support_tickets WHERE status NOT IN ('resolved','closed')")->fetch();
    json_ok(['count' => (int)$row['count']]);
}

if (!$r['id'] && $r['method'] === 'GET') {
    require_auth();
    $where = [];
    $params = [];

    if (!empty($_GET['status'])) {
        $where[] = 'st.status = ?';
        $params[] = $_GET['status'];
    }

    $count_sql = 'SELECT COUNT(*) as c FROM support_tickets st' . ($where ? ' WHERE ' . implode(' AND ', $where) : '');
    $cs = db()->prepare($count_sql);
    $cs->execute($params);
    $total = (int)$cs->fetch()['c'];

    $sql = 'SELECT st.*, tm.name_ar as assignee_name
            FROM support_tickets st
            LEFT JOIN team_members tm ON tm.id = st.assigned_to';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY st.created_at DESC';

    $limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $sql .= " LIMIT $limit OFFSET $offset";

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if ($row['assignee_name']) $row['team_member'] = ['name_ar' => $row['assignee_name']];
        unset($row['assignee_name']);
    }
    json_ok(['data' => $rows, 'total' => $total]);
}

if (!$r['id'] && $r['method'] === 'POST') {
    $b = body();
    $id = uuid();
    $number = generateTicketNumber();
    db()->prepare(
        'INSERT INTO support_tickets (id, ticket_number, client_id, name, email, subject, description, category, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $number,
        $b['client_id'] ?? null,
        $b['name'] ?? '',
        $b['email'] ?? '',
        $b['subject'] ?? '',
        $b['description'] ?? '',
        $b['category'] ?? 'general',
        $b['priority'] ?? 'medium',
        'open',
    ]);
    $stmt = db()->prepare('SELECT * FROM support_tickets WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'GET') {
    require_auth();
    $stmt = db()->prepare('SELECT * FROM support_tickets WHERE id = ?');
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
    $allowed = ['status','priority','category','assigned_to','subject','description'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[] = $b[$f];
        }
    }
    if (!$fields) json_err('No fields to update', 400);
    $params[] = $r['id'];
    db()->prepare('UPDATE support_tickets SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    $stmt = db()->prepare('SELECT * FROM support_tickets WHERE id = ?');
    $stmt->execute([$r['id']]);
    json_ok($stmt->fetch());
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM support_tickets WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
