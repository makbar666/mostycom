<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

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

require_once __DIR__ . '/../../../../laravel_backend/bootstrap.php';

Http::cors(['GET', 'POST']);

$pdo = Database::connection();

/*
|--------------------------------------------------------------------------
| Fix: tabel harus 'faq', bukan 'faqs'
|--------------------------------------------------------------------------
*/
$table = "faq";

/*
|--------------------------------------------------------------------------
| Pastikan tabel ada (auto create)
|--------------------------------------------------------------------------
*/
$check = $pdo->prepare("SHOW TABLES LIKE :tbl");
$check->execute(['tbl' => $table]);

if (!$check->fetchColumn()) {
    $pdo->exec("
        CREATE TABLE `{$table}` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `judul` VARCHAR(255) NOT NULL,
            `isi` TEXT NOT NULL,
            `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
}

/*
|--------------------------------------------------------------------------
| GET – Public
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $statement = $pdo->query(
        "SELECT id, judul, isi, created_at, updated_at
         FROM {$table}
         ORDER BY created_at DESC"
    );

    Http::json([
        'success' => true,
        'data' => $statement->fetchAll()
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST – Require Token
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

$payload = json_decode(file_get_contents('php://input'), true) ?? [];

$judul = trim((string) ($payload['judul'] ?? ''));
$isi   = trim((string) ($payload['isi'] ?? ''));

if ($judul === '' || $isi === '') {
    Http::json(['success' => false, 'message' => 'Judul dan isi wajib diisi'], 422);
    exit;
}

$now = date('Y-m-d H:i:s');

$insert = $pdo->prepare(
    "INSERT INTO {$table} (judul, isi, created_at, updated_at)
     VALUES (:judul, :isi, :created_at, :updated_at)"
);

$insert->execute([
    'judul'      => $judul,
    'isi'        => $isi,
    'created_at' => $now,
    'updated_at' => $now,
]);

$id = (int) $pdo->lastInsertId();

$stmt = $pdo->prepare(
    "SELECT id, judul, isi, created_at, updated_at 
     FROM {$table}
     WHERE id = :id LIMIT 1"
);
$stmt->execute(['id' => $id]);

Http::json([
    'success' => true,
    'message' => "FAQ berhasil ditambahkan",
    'data'    => $stmt->fetch()
], 201);
exit;
