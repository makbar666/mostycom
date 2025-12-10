<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\Auth;
use Mostycom\Database;
use Mostycom\Http;
use Mostycom\UserRepository;

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
| Load bootstrap (3x naik folder)
|--------------------------------------------------------------------------
| Struktur Project:
| /home/mosb4829/laravel_backend/bootstrap.php
| /home/mosb4829/public_html/public/api/users.php
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
| Authentication
|--------------------------------------------------------------------------
*/
try {
    $auth = Auth::userOrFail();
} catch (RuntimeException $exception) {
    Http::json(['success' => false, 'message' => $exception->getMessage()], 401);
    exit;
}

/*
|--------------------------------------------------------------------------
| Repository & Database
|--------------------------------------------------------------------------
*/
$pdo        = Database::connection();
$repository = new UserRepository($pdo);

/*
|--------------------------------------------------------------------------
| GET — list all users
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    Http::json([
        'success' => true,
        'data'    => $repository->all(),
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Only POST allowed after this
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
    exit;
}

/*
|--------------------------------------------------------------------------
| POST — Create new user
|--------------------------------------------------------------------------
*/
$payload  = json_decode(file_get_contents('php://input'), true) ?? [];
$name     = trim((string) ($payload['name'] ?? ''));
$email    = strtolower(trim((string) ($payload['email'] ?? '')));
$password = trim((string) ($payload['password'] ?? ''));
$role     = isset($payload['role']) ? trim((string) $payload['role']) : null;

/*
|--------------------------------------------------------------------------
| Validasi input
|--------------------------------------------------------------------------
*/
if ($name === '' || $email === '' || $password === '') {
    Http::json(['success' => false, 'message' => 'Nama, email, dan password wajib diisi'], 422);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Http::json(['success' => false, 'message' => 'Format email tidak valid'], 422);
    exit;
}

if (strlen($password) < 6) {
    Http::json(['success' => false, 'message' => 'Password minimal 6 karakter'], 422);
    exit;
}

if ($repository->emailExists($email)) {
    Http::json(['success' => false, 'message' => 'Email sudah terdaftar'], 409);
    exit;
}

/*
|--------------------------------------------------------------------------
| Simpan user baru
|--------------------------------------------------------------------------
*/
$user = $repository->create($name, $email, $password, $role);

/*
|--------------------------------------------------------------------------
| Response sukses
|--------------------------------------------------------------------------
*/
Http::json([
    'success' => true,
    'message' => 'User berhasil ditambahkan',
    'data'    => $user,
], 201);

exit;
