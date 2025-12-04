<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/
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
| Load bootstrap (4x naik folder)
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
| GET – Public
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = $pdo->query(
        'SELECT id, nama, isi, rate, foto, created_at, updated_at
         FROM testimoni
         ORDER BY created_at DESC'
    );

    $rows = $statement->fetchAll();

    $data = array_map(static function (array $row): array {
        $row['image_url'] = $row['foto']
            ? "/public/uploads/testimonials/" . $row['foto']
            : null;
        return $row;
    }, $rows);

    Http::json(['success' => true, 'data' => $data]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST – Wajib Login
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
| Payload
|--------------------------------------------------------------------------
*/
$payload = json_decode(file_get_contents('php://input'), true) ?? [];

$nama = trim((string)($payload['nama'] ?? ''));
$isi  = trim((string)($payload['isi'] ?? ''));
$rate = isset($payload['rate']) ? (int) $payload['rate'] : 5;

if ($nama === '' || $isi === '') {
    Http::json(['success' => false, 'message' => 'Nama dan isi wajib diisi'], 422);
    exit;
}

/*
|--------------------------------------------------------------------------
| Upload Foto Base64 – FIXED
|--------------------------------------------------------------------------
*/
$foto = null;

if (!empty($payload['image_base64'])) {

    $base64 = $payload['image_base64'];

    // Pisahkan meta dan data
    if (str_contains($base64, ',')) {
        [, $content] = explode(',', $base64, 2);
    } else {
        $content = $base64;
    }

    $content = str_replace(' ', '+', $content);
    $binary = base64_decode($content, true);

    if ($binary === false) {
        Http::json(['success' => false, 'message' => 'Base64 tidak valid'], 422);
        exit;
    }

    // Path upload harus ke /public/uploads/testimonials/
    $dir = $_SERVER['DOCUMENT_ROOT'] . '/public/uploads/testimonials/';

    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $filename = 'testimonial_' . time() . '_' . bin2hex(random_bytes(4)) . '.png';

    if (!file_put_contents($dir . $filename, $binary)) {
        Http::json(['success' => false, 'message' => 'Gagal menyimpan foto'], 500);
        exit;
    }

    $foto = $filename;
}

/*
|--------------------------------------------------------------------------
| Insert DB
|--------------------------------------------------------------------------
*/
$now = date('Y-m-d H:i:s');

$insert = $pdo->prepare(
    'INSERT INTO testimoni (nama, isi, rate, foto, created_at, updated_at)
     VALUES (:nama, :isi, :rate, :foto, :created_at, :updated_at)'
);

$insert->execute([
    'nama'       => $nama,
    'isi'        => $isi,
    'rate'       => $rate,
    'foto'       => $foto,
    'created_at' => $now,
    'updated_at' => $now,
]);

$id = (int) $pdo->lastInsertId();

/*
|--------------------------------------------------------------------------
| Get Created
|--------------------------------------------------------------------------
*/
$statement = $pdo->prepare(
    'SELECT id, nama, isi, rate, foto, created_at, updated_at
     FROM testimoni
     WHERE id = :id LIMIT 1'
);

$statement->execute(['id' => $id]);

$created = $statement->fetch();

if ($created) {
    $created['image_url'] = $created['foto']
        ? "/public/uploads/testimonials/" . $created['foto']
        : null;
}

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/
Http::json([
    'success' => true,
    'message' => 'Testimoni berhasil ditambahkan',
    'data'    => $created
]);
exit;
