<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap.php';

use Mostycom\Http;
use Mostycom\TokenStore;

Http::cors(['POST']);

$token = Http::bearerToken();
if (!$token) {
    Http::json(['success' => false, 'message' => 'Token tidak ditemukan'], 400);
    exit;
}

$tokenStore = new TokenStore(__DIR__ . '/../../storage/tokens');
$tokenStore->delete($token);

Http::json(['success' => true, 'message' => 'Logout berhasil']);
