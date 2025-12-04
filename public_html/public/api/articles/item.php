<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../laravel_backend/bootstrap.php';

use Mostycom\ArticleHelper;
use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;

Http::cors(['GET', 'PUT', 'DELETE']);

try {
    Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    Http::json(['success' => false, 'message' => 'ID tidak valid'], 422);
    exit;
}

$pdo = Database::connection();

$statement = $pdo->prepare('SELECT id, judul, kategori, gambar, isi, status, created_at, updated_at FROM articles WHERE id = :id LIMIT 1');
$statement->execute(['id' => $id]);
$article = $statement->fetch();

if (!$article) {
    Http::json(['success' => false, 'message' => 'Artikel tidak ditemukan'], 404);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $article['gambar_url'] = ArticleHelper::buildImageUrl($article['gambar'] ?? null);
    Http::json(['success' => true, 'data' => $article]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $delete = $pdo->prepare('DELETE FROM articles WHERE id = :id');
    $delete->execute(['id' => $id]);
    if (!empty($article['gambar'])) {
      $path = __DIR__ . '/../../' . $article['gambar'];
      if (file_exists($path)) {
          @unlink($path);
      }
    }
    Http::json(['success' => true, 'message' => 'Artikel berhasil dihapus']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$judul = trim((string) ($payload['judul'] ?? $article['judul']));
$kategori = trim((string) ($payload['kategori'] ?? $article['kategori']));
$isi = trim((string) ($payload['isi'] ?? $article['isi']));
$statusInput = strtolower(trim((string) ($payload['status'] ?? $article['status'] ?? 'draft')));

if ($judul === '') {
    Http::json(['success' => false, 'message' => 'Judul wajib diisi'], 422);
    exit;
}

$allowedStatus = ['publish', 'draft', 'review'];
if (!in_array($statusInput, $allowedStatus, true)) {
    $statusInput = 'draft';
}
$status = $statusInput;

$imagePath = $article['gambar'];
if (!empty($payload['image_base64'])) {
    try {
        $imagePath = ArticleHelper::saveImage($payload['image_base64']);
    } catch (RuntimeException $exception) {
        Http::json(['success' => false, 'message' => $exception->getMessage()], 500);
        exit;
    }
}

$update = $pdo->prepare('UPDATE articles SET judul = :judul, kategori = :kategori, gambar = :gambar, isi = :isi, status = :status, updated_at = :updated_at WHERE id = :id');
$update->execute([
    'judul' => $judul,
    'kategori' => $kategori,
    'gambar' => $imagePath,
    'isi' => $isi,
    'status' => $status,
    'updated_at' => date('Y-m-d H:i:s'),
    'id' => $id
]);

$statement->execute(['id' => $id]);
$updated = $statement->fetch();
if ($updated) {
    $updated['gambar_url'] = ArticleHelper::buildImageUrl($updated['gambar'] ?? null);
}

Http::json([
    'success' => true,
    'message' => 'Artikel berhasil diperbarui',
    'data' => $updated
]);
