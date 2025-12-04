<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\Database;
use Mostycom\Http;
use Mostycom\TripHelper;

Http::cors(['GET']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$pdo = Database::connection();
$statement = $pdo->prepare('SELECT id, nama_trip, destinasi, jadwal, gambar, status, created_at FROM trips WHERE LOWER(status) = :status ORDER BY created_at DESC LIMIT 20');
$statement->execute(['status' => 'publish']);
$rows = $statement->fetchAll() ?: [];
$data = array_map(static function (array $row): array {
    $row['gambar_url'] = TripHelper::buildImageUrl($row['gambar'] ?? null);
    return $row;
}, $rows);

Http::json([
    'success' => true,
    'data' => $data,
]);

