<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap.php';

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;
use Mostycom\UserRepository;

Http::cors(['GET', 'PUT', 'DELETE']);

try {
    $auth = Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    Http::json(['success' => false, 'message' => 'ID user tidak valid'], 422);
    exit;
}

$currentUserId = (int) ($auth['user']['id'] ?? 0);
$pdo = Database::connection();
$repository = new UserRepository($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = $repository->find($id);
    if (!$user) {
        Http::json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'data' => $user]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($id === $currentUserId) {
        Http::json(['success' => false, 'message' => 'Anda tidak dapat menghapus akun yang sedang dipakai'], 422);
        exit;
    }
    $deleted = $repository->delete($id);
    if (!$deleted) {
        Http::json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        exit;
    }
    Http::json(['success' => true, 'message' => 'User berhasil dihapus']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$name = array_key_exists('name', $payload) ? trim((string) $payload['name']) : null;
$email = array_key_exists('email', $payload) ? strtolower(trim((string) $payload['email'])) : null;
$password = array_key_exists('password', $payload) ? trim((string) $payload['password']) : null;
$role = array_key_exists('role', $payload) ? trim((string) $payload['role']) : null;

if ($name !== null && $name === '') {
    Http::json(['success' => false, 'message' => 'Nama tidak boleh kosong'], 422);
    exit;
}

if ($email !== null) {
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Http::json(['success' => false, 'message' => 'Format email tidak valid'], 422);
        exit;
    }
    if ($repository->emailExists($email, $id)) {
        Http::json(['success' => false, 'message' => 'Email sudah digunakan'], 409);
        exit;
    }
}

if ($password !== null && $password !== '' && strlen($password) < 6) {
    Http::json(['success' => false, 'message' => 'Password minimal 6 karakter'], 422);
    exit;
}

if ($password !== null && $password === '') {
    $password = null;
}

if ($role !== null && $role === '') {
    $role = null;
}

if ($name === null && $email === null && $password === null && $role === null) {
    Http::json(['success' => false, 'message' => 'Tidak ada perubahan yang dikirim'], 422);
    exit;
}

$updated = $repository->update($id, [
    'name' => $name,
    'email' => $email,
    'password' => $password,
    'role' => $role,
]);

if (!$updated) {
    Http::json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
    exit;
}

Http::json([
    'success' => true,
    'message' => 'User berhasil diperbarui',
    'data' => $updated,
]);

