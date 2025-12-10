<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;
use Mostycom\TripHelper;
use Mostycom\TripPhotoService;
use Mostycom\TripRouteService;

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
| Path bootstrap.php 
| (4x naik karena file berada di /public/api/trips/)
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
| GET — PUBLIC (tanpa token)
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $keyword = isset($_GET['keyword']) ? trim((string) $_GET['keyword']) : '';
    $conditions = ['status = :status'];
    $params = ['status' => 'publish'];

    if ($keyword !== '') {
        $conditions[] = '(nama_trip LIKE :keyword OR destinasi LIKE :keyword)';
        $params['keyword'] = '%' . $keyword . '%';
    }

    $whereClause = 'WHERE ' . implode(' AND ', $conditions);

    $statement = $pdo->prepare(
        "SELECT id, nama_trip, destinasi, jadwal, gambar, status, terms, term_visa, catatan_trip, created_at, updated_at 
         FROM trips 
         {$whereClause}
         ORDER BY created_at DESC"
    );
    $statement->execute($params);

    $rows = $statement->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $tripIds = array_map('intval', array_column($rows, 'id'));
    $routesByTrip = TripRouteService::getRoutesByTripIds($pdo, $tripIds);
    $photosByTrip = TripPhotoService::getPhotosByTripIds($pdo, $tripIds);

    $data = array_map(static function (array $row) use ($routesByTrip, $photosByTrip): array {
        $tripId = (int) $row['id'];
        $photos = $photosByTrip[$tripId] ?? [];
        if (!$photos && !empty($row['gambar'])) {
            $photos = TripPhotoService::buildLegacyPhotos($row['gambar']);
        }
        $primaryPhoto = null;
        foreach ($photos as $photo) {
            if (!empty($photo['is_primary'])) {
                $primaryPhoto = $photo;
                break;
            }
        }
        if (!$primaryPhoto && isset($photos[0])) {
            $primaryPhoto = $photos[0];
        }
        $row['gambar_url'] = $primaryPhoto['photo_full_url'] ?? TripHelper::buildImageUrl($row['gambar'] ?? null);
        $row['routes'] = $routesByTrip[$tripId] ?? [];
        $row['photos'] = $photos;
        return $row;
    }, $rows);

    Http::json(['success' => true, 'data' => $data]);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST — PRIVATE (WAJIB token)
|--------------------------------------------------------------------------
*/
try {
    Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json([
        'success' => false,
        'message' => $exception->getMessage()
    ], 401);
    exit;
}

/*
|--------------------------------------------------------------------------
| Validasi method POST
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

/*
|--------------------------------------------------------------------------
| Processing CREATE Trip
|--------------------------------------------------------------------------
*/
$payload = json_decode(file_get_contents('php://input'), true) ?? [];

$namaTrip    = trim((string) ($payload['nama_trip'] ?? ''));
$destinasi   = trim((string) ($payload['destinasi'] ?? ''));
$jadwalInput = trim((string) ($payload['jadwal'] ?? ''));
$statusInput = strtolower(trim((string) ($payload['status'] ?? 'draft')));
$routesPayload = $payload['routes'] ?? null;
$termsInput = trim((string) ($payload['terms'] ?? ''));
$termVisaInput = trim((string) ($payload['term_visa'] ?? ''));
$catatanTripInput = trim((string) ($payload['catatan_trip'] ?? ''));
$photosPayload = TripPhotoService::normalizePhotosPayload($payload['photos'] ?? []);

if (!$photosPayload && !empty($payload['image_base64'])) {
    $photosPayload[] = [
        'image_base64' => $payload['image_base64'],
        'is_primary' => true,
        'sort_order' => 1,
    ];
}

/*
|--------------------------------------------------------------------------
| Validasi input
|--------------------------------------------------------------------------
*/
if ($namaTrip === '') {
    Http::json(['success' => false, 'message' => 'Nama trip wajib diisi'], 422);
    exit;
}

$allowedStatus = ['publish', 'draft'];
$status = in_array($statusInput, $allowedStatus, true)
    ? $statusInput
    : 'draft';

$jadwal = null;
if ($jadwalInput !== '') {
    $timestamp = strtotime($jadwalInput);
    if ($timestamp !== false) {
        $jadwal = date('Y-m-d', $timestamp);
    }
}
$terms = $termsInput !== '' ? $termsInput : null;
$termVisa = $termVisaInput !== '' ? $termVisaInput : null;
$catatanTrip = $catatanTripInput !== '' ? $catatanTripInput : null;

try {
    $normalizedRoutes = TripRouteService::normalizeRoutesPayload($routesPayload);
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 422);
    exit;
}

/*
|--------------------------------------------------------------------------
| Insert ke database
|--------------------------------------------------------------------------
*/
$now = date('Y-m-d H:i:s');

$insert = $pdo->prepare(
    'INSERT INTO trips (nama_trip, destinasi, jadwal, gambar, status, terms, term_visa, catatan_trip, created_at, updated_at)
     VALUES (:nama_trip, :destinasi, :jadwal, :gambar, :status, :terms, :term_visa, :catatan_trip, :created_at, :updated_at)'
);
$photos = [];

try {
    $pdo->beginTransaction();

    $insert->execute([
        'nama_trip'  => $namaTrip,
        'destinasi'  => $destinasi,
        'jadwal'     => $jadwal,
        'gambar'     => null,
        'status'     => $status,
        'terms'      => $terms,
        'term_visa'  => $termVisa,
        'catatan_trip' => $catatanTrip,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $id = (int) $pdo->lastInsertId();
    TripRouteService::saveRoutes($pdo, $id, $normalizedRoutes);
    $photos = TripPhotoService::syncPhotos($pdo, $id, $photosPayload);

    $pdo->commit();
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}

/*
|--------------------------------------------------------------------------
| Fetch trip yang baru dibuat
|--------------------------------------------------------------------------
*/
$statement = $pdo->prepare(
    'SELECT id, nama_trip, destinasi, jadwal, gambar, status, terms, term_visa, catatan_trip, created_at, updated_at 
     FROM trips WHERE id = :id LIMIT 1'
);
$statement->execute(['id' => $id]);
$createdRow = $statement->fetch();

if ($createdRow) {
    $createdRow['gambar_url'] = TripHelper::buildImageUrl($createdRow['gambar'] ?? null);
    $createdRow['routes'] = TripRouteService::getRoutesForTrip($pdo, $id);
    $createdRow['photos'] = $photos ?? TripPhotoService::getPhotosForTrip($pdo, $id);
}

/*
|--------------------------------------------------------------------------
| Response sukses
|--------------------------------------------------------------------------
*/
Http::json([
    'success' => true,
    'message' => 'Trip berhasil dibuat',
    'data'    => $createdRow
]);
exit;
