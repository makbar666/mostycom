<?php

declare(strict_types=1);

namespace Mostycom;

use RuntimeException;

class TokenStore
{
    private string $directory;

    public function __construct(string $directory)
    {
        $this->directory = rtrim($directory, '/');
        if (!is_dir($this->directory) && !mkdir($this->directory, 0755, true) && !is_dir($this->directory)) {
            throw new RuntimeException('Unable to create token storage directory');
        }
    }

    public function create(array $payload, int $ttlSeconds = 86400): string
    {
        $token = bin2hex(random_bytes(32));
        $data = [
            'token' => $token,
            'user' => $payload,
            'expires_at' => time() + $ttlSeconds,
        ];
        file_put_contents($this->path($token), json_encode($data));
        return $token;
    }

    public function get(string $token): ?array
    {
        $path = $this->path($token);
        if (!file_exists($path)) {
            return null;
        }
        $data = json_decode(file_get_contents($path), true);
        if (!$data) {
            unlink($path);
            return null;
        }
        if (($data['expires_at'] ?? 0) < time()) {
            unlink($path);
            return null;
        }
        return $data;
    }

    public function delete(string $token): void
    {
        $path = $this->path($token);
        if (file_exists($path)) {
            unlink($path);
        }
    }

    private function path(string $token): string
    {
        return $this->directory . '/' . preg_replace('/[^a-f0-9]/i', '', $token) . '.json';
    }
}
