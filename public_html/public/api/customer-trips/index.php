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
$table = "customer_trips";

/*
|--------------------------------------------------------------------------
| GET – Public (tanpa token)
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $kode = trim((string) ($_GET['kode_booking'] ?? ''));

    /*
    |--------------------------------------------------------------------------
    | GET by kode_booking → Public
    |--------------------------------------------------------------------------
    */
    if ($kode !== '') {
        $stmt = $pdo->prepare(
            "SELECT id, nama, kode_booking, status, created_at, updated_at
             FROM {$table}
             WHERE kode_booking = :kode_booking
             LIMIT 1"
        );
        $stmt->execute(['kode_booking' => $kode]);

        $record = $stmt->fetch();

        if (!$record) {
            Http::json(['success' => false, 'message' => 'Kode booking tidak ditemukan'], 404);
            exit;
        }

        Http::json(['success' => true, 'data' => $record]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | GET list dengan optional filter nama / status / kode_booking
    |--------------------------------------------------------------------------
    */
    $where = [];
    $params = [];

    if (!empty($_GET['nama'])) {
        $where[] = "nama LIKE :nama";
        $params['nama'] = "%" . trim($_GET['nama']) . "%";
    }

    if (!empty($_GET['status'])) {
        $where[] = "status = :status";
        $params['status'] = trim($_GET['status']);
    }

    if (!empty($_GET['kode_booking'])) {
        $where[] = "kode_booking = :kode_booking";
        $params['kode_booking'] = trim($_GET['kode_booking']);
    }

    $query = "SELECT id, nama, kode_booking, status, created_at, updated_at FROM {$table}";

    if ($where) {
        $query .= " WHERE " . implode(" AND ", $where);
    }

    $query .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    $rows = $stmt->fetchAll();

    Http::json([
        'success' => true,
        'data'    => $rows,
        'meta'    => [
            'allowed_status' => ['ongoing', 'done', 'cancelled'],
            'count' => count($rows)
        ]
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST – Private, wajib token
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

$nama  = trim((string) ($payload['nama'] ?? ''));
$kode  = strtoupper(trim((string) ($payload['kode_booking'] ?? '')));
$statusInput = trim((string) ($payload['status'] ?? 'ongoing'));

/*
|--------------------------------------------------------------------------
| Validasi
|--------------------------------------------------------------------------
*/
if ($nama === '' || $kode === '') {
    Http::json(['success' => false, 'message' => 'Nama dan kode booking wajib diisi'], 422);
    exit;
}

if (!preg_match('/^[A-Z0-9-]{4,}$/', $kode)) {
    Http::json(['success' => false, 'message' => 'Format kode booking minimal 4 karakter & uppercase'], 422);
    exit;
}

$allowedStatus = ['ongoing', 'done', 'cancelled'];
$status = in_array($statusInput, $allowedStatus, true) ? $statusInput : 'ongoing';

/*
|--------------------------------------------------------------------------
| Insert DB
|--------------------------------------------------------------------------
*/
$now = date('Y-m-d H:i:s');

$insert = $pdo->prepare(
    "INSERT INTO {$table} (nama, kode_booking, status, created_at, updated_at)
     VALUES (:nama, :kode_booking, :status, :created_at, :updated_at)"
);

$insert->execute([
    'nama'         => $nama,
    'kode_booking' => $kode,
    'status'       => $status,
    'created_at'   => $now,
    'updated_at'   => $now,
]);

$id = (int) $pdo->lastInsertId();

/*
|--------------------------------------------------------------------------
| Ambil data terbaru
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare(
    "SELECT id, nama, kode_booking, status, created_at, updated_at
     FROM {$table}
     WHERE id = :id LIMIT 1"
);
$stmt->execute(['id' => $id]);

$created = $stmt->fetch();

/*
|--------------------------------------------------------------------------
| Response sukses
|--------------------------------------------------------------------------
*/
Http::json([
    'success' => true,
    'message' => 'Customer trip berhasil dicatat',
    'data'    => $created
], 201);
exit;
