<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\Auth;
use Mostycom\CustomerTripRepository;
use Mostycom\Database;
use Mostycom\Http;

Http::cors(['GET', 'PUT', 'DELETE']);

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$requiresAuth = !($method === 'GET' && isset($_GET['kode_booking']));

if ($requiresAuth) {
    try {
        Auth::userOrFail();
    } catch (RuntimeException $exception) {
        Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
        exit;
    }
}

$pdo = Database::connection();
$repository = new CustomerTripRepository($pdo);

if ($method === 'GET') {
    if (isset($_GET['kode_booking'])) {
        $booking = trim((string) $_GET['kode_booking']);
        if ($booking === '') {
            Http::json(['success' => false, 'message' => 'Kode booking wajib diisi'], 422);
            exit;
        }
        $trip = $repository->findByBookingCode($booking);
        if (!$trip) {
            Http::json(['success' => false, 'message' => 'Customer trip tidak ditemukan'], 404);
            exit;
        }
        Http::json(['success' => true, 'data' => $trip]);
        exit;
    }

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        Http::json(['success' => false, 'message' => 'ID customer trip tidak valid'], 422);
        exit;
    }

    $trip = $repository->find($id);
    if (!$trip) {
        Http::json(['success' => false, 'message' => 'Customer trip tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'data' => $trip]);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    Http::json(['success' => false, 'message' => 'ID customer trip tidak valid'], 422);
    exit;
}

if ($method === 'DELETE') {
    $deleted = $repository->delete($id);
    if (!$deleted) {
        Http::json(['success' => false, 'message' => 'Customer trip tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'message' => 'Customer trip dihapus']);
    exit;
}

if ($method !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$updates = [];

if (array_key_exists('nama', $payload)) {
    $nama = trim((string) $payload['nama']);
    if ($nama === '') {
        Http::json(['success' => false, 'message' => 'Nama tidak boleh kosong'], 422);
        exit;
    }
    $updates['nama'] = $nama;
}

if (array_key_exists('kode_booking', $payload)) {
    $kodeBooking = strtoupper(trim((string) $payload['kode_booking']));
    if ($kodeBooking === '' || !preg_match('/^[A-Z0-9-]{4,}$/', $kodeBooking)) {
        Http::json(['success' => false, 'message' => 'Format kode booking tidak valid'], 422);
        exit;
    }
    $updates['kode_booking'] = $kodeBooking;
}

if (array_key_exists('status', $payload)) {
    $updates['status'] = (string) $payload['status'];
}

if (!$updates) {
    Http::json(['success' => false, 'message' => 'Tidak ada perubahan yang dikirim'], 422);
    exit;
}

$updated = $repository->update($id, $updates);
if (!$updated) {
    Http::json(['success' => false, 'message' => 'Customer trip tidak ditemukan'], 404);
    exit;
}

Http::json([
    'success' => true,
    'message' => 'Customer trip diperbarui',
    'data' => $updated,
]);
