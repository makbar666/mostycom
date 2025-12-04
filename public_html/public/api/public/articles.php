<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\ArticleHelper;
use Mostycom\Database;
use Mostycom\Http;

Http::cors(['GET']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$pdo = Database::connection();
$statement = $pdo->prepare('SELECT id, judul, kategori, isi, gambar, status, created_at FROM articles WHERE LOWER(status) = :status ORDER BY created_at DESC LIMIT 12');
$statement->execute(['status' => 'publish']);
$rows = $statement->fetchAll() ?: [];
$data = array_map(static function (array $row): array {
    $row['gambar_url'] = ArticleHelper::buildImageUrl($row['gambar'] ?? null);
    return $row;
}, $rows);

Http::json([
    'success' => true,
    'data' => $data,
]);

