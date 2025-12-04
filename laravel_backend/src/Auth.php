<?php

declare(strict_types=1);

namespace Mostycom;

use RuntimeException;

class Auth
{
    public static function userOrFail(): array
    {
        $token = Http::bearerToken();
        if (!$token) {
            throw new RuntimeException('Token tidak ditemukan');
        }
        $tokenStore = new TokenStore(__DIR__ . '/../storage/tokens');
        $data = $tokenStore->get($token);
        if (!$data) {
            throw new RuntimeException('Token tidak valid atau kadaluarsa');
        }

        return [
            'token' => $token,
            'user' => $data['user'],
        ];
    }
}
