<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\Auth;
use Mostycom\ContactHelper;
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

$pdo   = Database::connection();
$table = ContactHelper::tableName();

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $statement = $pdo->query("SELECT * FROM `$table` ORDER BY id DESC LIMIT 1");
    $row = $statement->fetch() ?: null;

    if ($row) {
        $row['header_image_url'] = ContactHelper::buildHeaderImageUrl($row['image_header'] ?? null);
        $row['trust_image_url']  = ContactHelper::buildTrustImageUrl($row['image_trush_score'] ?? null);
    }

    Http::json([
        'success' => true,
        'data'    => $row
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST
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

$payload    = json_decode(file_get_contents('php://input'), true) ?? [];
$normalized = ContactHelper::normalizePayload($payload);

$columns = ContactHelper::resolveColumns($pdo);

$setClauses = [];
foreach ($columns as $alias => $columnName) {
    $setClauses[] = "`$columnName` = :$alias";
}

$now      = date('Y-m-d H:i:s');
$params   = $normalized;
$targetId = isset($payload['id']) ? (int)$payload['id'] : 0;

/*
|--------------------------------------------------------------------------
| JANGAN HILANGKAN GAMBAR — Ambil data lama DULU
|--------------------------------------------------------------------------
*/
if ($targetId > 0) {

    $oldRow = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id LIMIT 1");
    $oldRow->execute(['id' => $targetId]);
    $old = $oldRow->fetch(PDO::FETCH_ASSOC);

    if (!$old) {
        Http::json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        exit;
    }

    // ⛔ Jika tidak upload gambar baru → pakai yang lama
    if (empty($params['header_image'])) {
        $params['header_image'] = $old['image_header'];
    }

    if (empty($params['trust_image'])) {
        $params['trust_image'] = $old['image_trush_score'];
    }

    // UPDATE
    $params['updated_at'] = $now;
    $params['id']         = $targetId;

    $sql = sprintf(
        "UPDATE `%s` SET %s, updated_at = :updated_at WHERE id = :id",
        $table,
        implode(', ', $setClauses)
    );

    $update = $pdo->prepare($sql);
    $update->execute($params);

} else {

    // INSERT
    $insertCols   = array_map(fn($c) => "`$c`", array_values($columns));
    $placeholders = array_map(fn($a) => ":$a", array_keys($columns));

    $params['created_at'] = $now;
    $params['updated_at'] = $now;

    $sql = sprintf(
        "INSERT INTO `%s` (%s, created_at, updated_at) VALUES (%s, :created_at, :updated_at)",
        $table,
        implode(', ', $insertCols),
        implode(', ', $placeholders)
    );

    $insert = $pdo->prepare($sql);
    $insert->execute($params);

    $targetId = (int)$pdo->lastInsertId();
}

/*
|--------------------------------------------------------------------------
| GET data terbaru kembali ke frontend
|--------------------------------------------------------------------------
*/
$latest = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id LIMIT 1");
$latest->execute(['id' => $targetId]);
$row = $latest->fetch() ?: null;

if ($row) {
    $row['header_image_url'] = ContactHelper::buildHeaderImageUrl($row['image_header'] ?? null);
    $row['trust_image_url']  = ContactHelper::buildTrustImageUrl($row['image_trush_score'] ?? null);
}

Http::json([
    'success' => true,
    'message' => 'Contact info berhasil diperbarui',
    'data'    => $row
]);
exit;
