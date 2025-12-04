<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap.php';

use Mostycom\Http;
use Mostycom\TokenStore;

Http::cors(['GET']);

$token = Http::bearerToken();
if (!$token) {
    Http::json(['success' => false, 'message' => 'Token tidak ditemukan'], 401);
    exit;
}

$tokenStore = new TokenStore(__DIR__ . '/../../storage/tokens');
$data = $tokenStore->get($token);

if (!$data) {
    Http::json(['success' => false, 'message' => 'Token tidak valid atau sudah kadaluarsa'], 401);
    exit;
}

Http::json([
    'success' => true,
    'user' => $data['user'],
]);
