<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\ContactHelper;
use Mostycom\Database;
use Mostycom\Http;

Http::cors(['GET']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$pdo = Database::connection();
$table = ContactHelper::tableName();

try {
    $columns = ContactHelper::resolveColumns($pdo);
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 500);
    exit;
}

$selectColumns = ContactHelper::selectColumns($columns);
$statement = $pdo->query(sprintf('SELECT %s FROM `%s` ORDER BY `id` DESC LIMIT 1', $selectColumns, $table));
$data = $statement->fetch() ?: null;

Http::json([
    'success' => true,
    'data' => $data,
]);

