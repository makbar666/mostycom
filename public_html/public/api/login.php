<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

use Mostycom\Database;
use Mostycom\Http;
use Mostycom\TokenStore;

set_exception_handler(function($e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'type' => 'exception',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);
    exit;
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'type' => 'error',
        'errno' => $errno,
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ]);
    exit;
});

require __DIR__ . '/../../../laravel_backend/bootstrap.php';

try {

    Http::cors(['POST']);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Http::json(['success' => false, 'message' => 'Method not allowed'], 405);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $email = trim(strtolower($input['email'] ?? ''));
    $password = trim($input['password'] ?? '');

    if ($email === '' || $password === '') {
        Http::json(['success' => false, 'message' => 'Email dan password wajib diisi'], 422);
        exit;
    }

    $pdo = Database::connection();
    $statement = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        Http::json(['success' => false, 'message' => 'Email atau password tidak valid'], 401);
        exit;
    }

    $tokenStore = new TokenStore(__DIR__ . '/../../../laravel_backend/storage/tokens');

    $payload = [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
    ];

    $tokenTtl = (int) env_value('AUTH_TOKEN_TTL', '86400');
    $token = $tokenStore->create($payload, $tokenTtl);

    Http::json([
        'success' => true,
        'message' => 'Login berhasil',
        'token' => $token,
        'expires_in' => $tokenTtl,
        'user' => $payload,
    ]);

} catch (Throwable $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'type' => 'caught_exception',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);
    exit;
}
