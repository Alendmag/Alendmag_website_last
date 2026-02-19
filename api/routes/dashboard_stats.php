<?php
require_auth();

$r = $GLOBALS['_ROUTE'];

if ($r['method'] !== 'GET') json_err('Method not allowed', 405);

$db = db();

$stats = [];

$tables = [
    'products'         => 'products',
    'orders'           => 'orders',
    'clients'          => 'clients',
    'projects'         => 'projects',
    'team_members'     => 'team_members',
    'blog_posts'       => 'blog_posts',
    'testimonials'     => 'testimonials',
    'contact_messages' => 'contact_messages',
    'support_tickets'  => 'support_tickets',
];

foreach ($tables as $key => $table) {
    $row = $db->query("SELECT COUNT(*) as c FROM `$table`")->fetch();
    $stats[$key . '_count'] = (int)$row['c'];
}

$active = $db->query("SELECT COUNT(*) as c FROM products WHERE is_active = 1")->fetch();
$stats['active_products'] = (int)$active['c'];

$pending_orders = $db->query("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'")->fetch();
$stats['pending_orders'] = (int)$pending_orders['c'];

$unread_messages = $db->query("SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0 AND is_archived = 0")->fetch();
$stats['unread_messages'] = (int)$unread_messages['c'];

$open_tickets = $db->query("SELECT COUNT(*) as c FROM support_tickets WHERE status NOT IN ('resolved','closed')")->fetch();
$stats['open_tickets'] = (int)$open_tickets['c'];

$inprogress = $db->query("SELECT COUNT(*) as c FROM projects WHERE status = 'in-progress'")->fetch();
$stats['inprogress_projects'] = (int)$inprogress['c'];

$published_posts = $db->query("SELECT COUNT(*) as c FROM blog_posts WHERE is_published = 1")->fetch();
$stats['published_posts'] = (int)$published_posts['c'];

$revenue = $db->query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status = 'completed'")->fetch();
$stats['total_revenue'] = (float)$revenue['total'];

$recent_orders = $db->query(
    "SELECT o.*, p.name_ar as product_name_ar FROM orders o
     LEFT JOIN products p ON p.id = o.product_id
     ORDER BY o.created_at DESC LIMIT 5"
)->fetchAll();
$stats['recent_orders'] = $recent_orders;

$recent_tickets = $db->query(
    "SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 5"
)->fetchAll();
$stats['recent_tickets'] = $recent_tickets;

$recent_messages = $db->query(
    "SELECT * FROM contact_messages WHERE is_archived = 0 ORDER BY created_at DESC LIMIT 5"
)->fetchAll();
$stats['recent_messages'] = $recent_messages;

json_ok($stats);
