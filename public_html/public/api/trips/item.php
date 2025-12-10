<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../laravel_backend/bootstrap.php';

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;
use Mostycom\TripHelper;
use Mostycom\TripPhotoService;
use Mostycom\TripRouteService;

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

$statement = $pdo->prepare('SELECT id, nama_trip, destinasi, jadwal, gambar, status, terms, term_visa, catatan_trip, created_at, updated_at FROM trips WHERE id = :id LIMIT 1');
$statement->execute(['id' => $id]);
$trip = $statement->fetch();
if (!$trip) {
    Http::json(['success' => false, 'message' => 'Trip tidak ditemukan'], 404);
    exit;
}
$trip['routes'] = TripRouteService::getRoutesForTrip($pdo, $id);
$trip['photos'] = TripPhotoService::getPhotosForTrip($pdo, $id);
if (!$trip['photos'] && !empty($trip['gambar'])) {
    $trip['photos'] = TripPhotoService::buildLegacyPhotos($trip['gambar']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $primaryPhoto = null;
    if (is_array($trip['photos'])) {
        foreach ($trip['photos'] as $photo) {
            if (!empty($photo['is_primary'])) {
                $primaryPhoto = $photo;
                break;
            }
        }
        if (!$primaryPhoto && isset($trip['photos'][0])) {
            $primaryPhoto = $trip['photos'][0];
        }
    }
    $trip['gambar_url'] = $primaryPhoto['photo_full_url'] ?? TripHelper::buildImageUrl($trip['gambar'] ?? null);
    Http::json(['success' => true, 'data' => $trip]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $pdo->beginTransaction();
        TripPhotoService::deletePhotosByTrip($pdo, $id);
        TripRouteService::deleteRoutesByTrip($pdo, $id);
        $delete = $pdo->prepare('DELETE FROM trips WHERE id = :id');
        $delete->execute(['id' => $id]);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
    TripHelper::deleteImage($trip['gambar'] ?? null);
    Http::json(['success' => true, 'message' => 'Trip berhasil dihapus']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$namaTrip = trim((string) ($payload['nama_trip'] ?? $trip['nama_trip']));
$destinasi = trim((string) ($payload['destinasi'] ?? $trip['destinasi']));
$jadwalInput = trim((string) ($payload['jadwal'] ?? ($trip['jadwal'] ?? '')));
$statusInput = strtolower(trim((string) ($payload['status'] ?? $trip['status'] ?? 'draft')));
$termsInput = trim((string) ($payload['terms'] ?? ($trip['terms'] ?? '')));
$termVisaInput = trim((string) ($payload['term_visa'] ?? ($trip['term_visa'] ?? '')));
$catatanTripInput = trim((string) ($payload['catatan_trip'] ?? ($trip['catatan_trip'] ?? '')));
$routesPayload = $payload['routes'] ?? null;

if ($namaTrip === '') {
    Http::json(['success' => false, 'message' => 'Nama trip wajib diisi'], 422);
    exit;
}

$allowedStatus = ['publish', 'draft'];
if (!in_array($statusInput, $allowedStatus, true)) {
    $statusInput = 'draft';
}
$status = $statusInput;

$jadwal = $trip['jadwal'];
if ($jadwalInput !== '') {
    $timestamp = strtotime($jadwalInput);
    if ($timestamp !== false) {
        $jadwal = date('Y-m-d', $timestamp);
    }
}
$terms = $termsInput !== '' ? $termsInput : null;
$termVisa = $termVisaInput !== '' ? $termVisaInput : null;
$catatanTrip = $catatanTripInput !== '' ? $catatanTripInput : null;

$photosPayload = null;
if (array_key_exists('photos', $payload)) {
    $photosPayload = TripPhotoService::normalizePhotosPayload($payload['photos']);
}
if ($photosPayload === null && !empty($payload['image_base64'])) {
    $photosPayload = [[
        'image_base64' => $payload['image_base64'],
        'is_primary' => true,
        'sort_order' => 1,
    ]];
}

try {
    $normalizedRoutes = TripRouteService::normalizeRoutesPayload($routesPayload);
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 422);
    exit;
}

$photos = $trip['photos'];

try {
    $pdo->beginTransaction();

    $update = $pdo->prepare('UPDATE trips SET nama_trip = :nama_trip, destinasi = :destinasi, jadwal = :jadwal, gambar = :gambar, status = :status, terms = :terms, term_visa = :term_visa, catatan_trip = :catatan_trip, updated_at = :updated_at WHERE id = :id');
    $update->execute([
        'nama_trip' => $namaTrip,
        'destinasi' => $destinasi,
        'jadwal' => $jadwal,
        'gambar' => $trip['gambar'],
        'status' => $status,
        'terms' => $terms,
        'term_visa' => $termVisa,
        'catatan_trip' => $catatanTrip,
        'updated_at' => date('Y-m-d H:i:s'),
        'id' => $id
    ]);

    TripRouteService::replaceRoutes($pdo, $id, $normalizedRoutes);
    $photos = $photosPayload !== null
        ? TripPhotoService::syncPhotos($pdo, $id, $photosPayload)
        : TripPhotoService::getPhotosForTrip($pdo, $id);

    $pdo->commit();
} catch (Throwable $exception) {
    $pdo->rollBack();
    throw $exception;
}

$statement->execute(['id' => $id]);
$updatedTrip = $statement->fetch();
if ($updatedTrip) {
    $photoList = $photos ?: [];
    if (!$photoList && !empty($updatedTrip['gambar'])) {
        $photoList = TripPhotoService::buildLegacyPhotos($updatedTrip['gambar']);
    }
    $primaryPhoto = null;
    if ($photoList) {
        foreach ($photoList as $photo) {
            if (!empty($photo['is_primary'])) {
                $primaryPhoto = $photo;
                break;
            }
        }
        if (!$primaryPhoto && isset($photoList[0])) {
            $primaryPhoto = $photoList[0];
        }
    }
    $updatedTrip['gambar_url'] = $primaryPhoto['photo_full_url'] ?? TripHelper::buildImageUrl($updatedTrip['gambar'] ?? null);
    $updatedTrip['routes'] = TripRouteService::getRoutesForTrip($pdo, $id);
    $updatedTrip['photos'] = $photoList;
}

Http::json([
    'success' => true,
    'message' => 'Trip berhasil diperbarui',
    'data' => $updatedTrip
]);
