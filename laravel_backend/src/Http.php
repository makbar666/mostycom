<?php

declare(strict_types=1);

namespace Mostycom;

class Http
{
    public static function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    public static function cors(array $methods = ['POST', 'GET']): void
    {
        header('Access-Control-Allow-Origin: ' . (env_value('CORS_ALLOW_ORIGIN', '*')));
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: ' . implode(', ', array_unique(array_merge($methods, ['OPTIONS']))));
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\\s+(.*)$/i', $header, $matches)) {
            return trim($matches[1]);
        }
        $queryToken = $_GET['token'] ?? null;
        return $queryToken ? trim($queryToken) : null;
    }
}
