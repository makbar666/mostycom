<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../laravel_backend/bootstrap.php';

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;
use Mostycom\TestimonialRepository;

Http::cors(['GET', 'PUT', 'DELETE']);

try {
    Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    Http::json(['success' => false, 'message' => 'ID testimoni tidak valid'], 422);
    exit;
}

$pdo = Database::connection();
$repository = new TestimonialRepository($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $testimonial = $repository->find($id);
    if (!$testimonial) {
        Http::json(['success' => false, 'message' => 'Testimoni tidak ditemukan'], 404);
        exit;
    }
    $testimonial['image_url'] = TestimonialRepository::buildImageUrl($testimonial['foto'] ?? null);
    Http::json(['success' => true, 'data' => $testimonial]);
    exit;
}

if ($method === 'DELETE') {
    $deleted = $repository->delete($id);
    if (!$deleted) {
        Http::json(['success' => false, 'message' => 'Testimoni tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'message' => 'Testimoni dihapus']);
    exit;
}

if ($method !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$updates = [];

if (array_key_exists('nama', $payload)) {
    $name = trim((string) $payload['nama']);
    if ($name === '') {
        Http::json(['success' => false, 'message' => 'Nama tidak boleh kosong'], 422);
        exit;
    }
    $updates['nama'] = $name;
}

if (array_key_exists('isi', $payload)) {
    $content = trim((string) $payload['isi']);
    if ($content === '') {
        Http::json(['success' => false, 'message' => 'Isi testimoni tidak boleh kosong'], 422);
        exit;
    }
    $updates['isi'] = $content;
}

if (array_key_exists('rate', $payload)) {
    $updates['rate'] = (int) $payload['rate'];
}

if (!empty($payload['image_base64'])) {
    try {
        $updates['foto'] = $repository->saveImageFromBase64($payload['image_base64']);
    } catch (RuntimeException $exception) {
        Http::json(['success' => false, 'message' => $exception->getMessage()], 422);
        exit;
    }
}

if (!$updates) {
    Http::json(['success' => false, 'message' => 'Tidak ada perubahan yang dikirim'], 422);
    exit;
}

$updated = $repository->update($id, $updates);
if (!$updated) {
    Http::json(['success' => false, 'message' => 'Testimoni tidak ditemukan'], 404);
    exit;
}
$updated['image_url'] = TestimonialRepository::buildImageUrl($updated['foto'] ?? null);

Http::json([
    'success' => true,
    'message' => 'Testimoni diperbarui',
    'data' => $updated,
]);
