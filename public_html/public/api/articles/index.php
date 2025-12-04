<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\ArticleHelper;
use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;

set_exception_handler(function($e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
    ]);
    exit;
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'type'    => 'php_error',
        'errno'   => $errno,
        'message' => $errstr,
        'file'    => $errfile,
        'line'    => $errline
    ]);
    exit;
});

/*
|--------------------------------------------------------------------------
| Load bootstrap (4x naik folder karena folder berada di /api/articles/)
|--------------------------------------------------------------------------
*/
require_once __DIR__ . '/../../../../laravel_backend/bootstrap.php';

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/
Http::cors(['GET', 'POST']);

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/
$pdo = Database::connection();

/*
|--------------------------------------------------------------------------
| GET – Public, tanpa token
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $statement = $pdo->query(
        'SELECT id, judul, kategori, gambar, isi, status, created_at, updated_at 
         FROM articles 
         ORDER BY created_at DESC'
    );

    $rows = $statement->fetchAll();

    $data = array_map(static function (array $row): array {
        $row['gambar_url'] = ArticleHelper::buildImageUrl($row['gambar'] ?? null);
        return $row;
    }, $rows);

    Http::json(['success' => true, 'data' => $data]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST – Private, WAJIB token
|--------------------------------------------------------------------------
*/
try {
    Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST – Create article
|--------------------------------------------------------------------------
*/
$payload  = json_decode(file_get_contents('php://input'), true) ?? [];

$judul    = trim((string) ($payload['judul'] ?? ''));
$kategori = trim((string) ($payload['kategori'] ?? ''));
$isi      = trim((string) ($payload['isi'] ?? ''));
$statusInput = strtolower(trim((string) ($payload['status'] ?? 'draft')));

/*
|--------------------------------------------------------------------------
| Validasi
|--------------------------------------------------------------------------
*/
if ($judul === '') {
    Http::json(['success' => false, 'message' => 'Judul wajib diisi'], 422);
    exit;
}

$allowedStatus = ['publish', 'draft', 'review'];
$status = in_array($statusInput, $allowedStatus, true)
    ? $statusInput
    : 'draft';

/*
|--------------------------------------------------------------------------
| Upload image (base64)
|--------------------------------------------------------------------------
*/
$imagePath = null;

if (!empty($payload['image_base64'])) {
    try {
        $imagePath = ArticleHelper::saveImage($payload['image_base64']);
    } catch (RuntimeException $exception) {
        Http::json(['success' => false, 'message' => $exception->getMessage()], 500);
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Insert DB
|--------------------------------------------------------------------------
*/
$now = date('Y-m-d H:i:s');

$insert = $pdo->prepare(
    'INSERT INTO articles (judul, kategori, gambar, isi, status, created_at, updated_at)
     VALUES (:judul, :kategori, :gambar, :isi, :status, :created_at, :updated_at)'
);

$insert->execute([
    'judul'       => $judul,
    'kategori'    => $kategori,
    'gambar'      => $imagePath,
    'isi'         => $isi,
    'status'      => $status,
    'created_at'  => $now,
    'updated_at'  => $now,
]);

$id = (int) $pdo->lastInsertId();

/*
|--------------------------------------------------------------------------
| Ambil data yang baru dibuat
|--------------------------------------------------------------------------
*/
$statement = $pdo->prepare(
    'SELECT id, judul, kategori, gambar, isi, status, created_at, updated_at 
     FROM articles 
     WHERE id = :id LIMIT 1'
);
$statement->execute(['id' => $id]);
$created = $statement->fetch();

if ($created) {
    $created['gambar_url'] = ArticleHelper::buildImageUrl($created['gambar'] ?? null);
}

/*
|--------------------------------------------------------------------------
| Response sukses
|--------------------------------------------------------------------------
*/
Http::json([
    'success' => true,
    'message' => 'Artikel berhasil dibuat',
    'data'    => $created
]);
exit;
