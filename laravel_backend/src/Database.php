<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $host = env_value('DB_HOST', '103.247.9.164');
        $port = env_value('DB_PORT', '3306');
        $database = env_value('DB_DATABASE', 'mosb4829_traveler_db');
        $username = env_value('DB_USERNAME', 'mosb4829_akbar');
        $password = env_value('DB_PASSWORD', 'oRZ0NY9_V^nN@E(W');

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database);

        try {
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $exception) {
            throw new RuntimeException('Failed to connect to database: ' . $exception->getMessage(), 0, $exception);
        }

        self::$connection = $pdo;

        return self::$connection;
    }
}
