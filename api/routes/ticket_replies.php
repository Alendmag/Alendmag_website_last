<?php
$r = $GLOBALS['_ROUTE'];

if (!$r['id'] && $r['method'] === 'GET') {
    if (empty($_GET['ticket_id'])) json_err('ticket_id required', 400);
    $stmt = db()->prepare(
        'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC'
    );
    $stmt->execute([$_GET['ticket_id']]);
    json_ok($stmt->fetchAll());
}

if (!$r['id'] && $r['method'] === 'POST') {
    $b = body();
    $id = uuid();
    $isAuth = !empty($_SESSION['admin_id']);
    $userName = $isAuth ? ($_SESSION['admin_name'] ?? 'Admin') : ($b['user_name'] ?? 'Client');
    $userType = $isAuth ? 'admin' : ($b['user_type'] ?? 'client');

    db()->prepare(
        'INSERT INTO ticket_replies (id, ticket_id, user_type, user_id, user_name, message, is_internal)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $b['ticket_id'] ?? '',
        $userType,
        $isAuth ? $_SESSION['admin_id'] : ($b['user_id'] ?? null),
        $userName,
        $b['message'] ?? '',
        isset($b['is_internal']) ? (int)$b['is_internal'] : 0,
    ]);

    if (!empty($b['ticket_id'])) {
        db()->prepare(
            "UPDATE support_tickets SET status = 'in-progress', updated_at = NOW() WHERE id = ? AND status = 'open'"
        )->execute([$b['ticket_id']]);
    }

    $stmt = db()->prepare('SELECT * FROM ticket_replies WHERE id = ?');
    $stmt->execute([$id]);
    json_ok($stmt->fetch(), 201);
}

if ($r['id'] && $r['method'] === 'DELETE') {
    require_auth();
    db()->prepare('DELETE FROM ticket_replies WHERE id = ?')->execute([$r['id']]);
    json_ok(['deleted' => true]);
}

json_err('Method not allowed', 405);
