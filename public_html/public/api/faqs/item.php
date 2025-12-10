<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\FaqRepository;
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
    Http::json(['success' => false, 'message' => 'ID FAQ tidak valid'], 422);
    exit;
}

$pdo = Database::connection();
$repository = new FaqRepository($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $faq = $repository->find($id);
    if (!$faq) {
        Http::json(['success' => false, 'message' => 'FAQ tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'data' => $faq]);
    exit;
}

if ($method === 'DELETE') {
    $deleted = $repository->delete($id);
    if (!$deleted) {
        Http::json(['success' => false, 'message' => 'FAQ tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'message' => 'FAQ dihapus']);
    exit;
}

if ($method !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$updates = [];

if (array_key_exists('judul', $payload)) {
    $title = trim((string) $payload['judul']);
    if ($title === '') {
        Http::json(['success' => false, 'message' => 'Judul tidak boleh kosong'], 422);
        exit;
    }
    $updates['judul'] = $title;
}

if (array_key_exists('isi', $payload)) {
    $content = trim((string) $payload['isi']);
    if ($content === '') {
        Http::json(['success' => false, 'message' => 'Isi tidak boleh kosong'], 422);
        exit;
    }
    $updates['isi'] = $content;
}

if (!$updates) {
    Http::json(['success' => false, 'message' => 'Tidak ada perubahan yang dikirim'], 422);
    exit;
}

$updated = $repository->update($id, $updates);
if (!$updated) {
    Http::json(['success' => false, 'message' => 'FAQ tidak ditemukan'], 404);
    exit;
}

Http::json([
    'success' => true,
    'message' => 'FAQ diperbarui',
    'data' => $updated,
]);
