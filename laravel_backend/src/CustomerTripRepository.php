<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;

class CustomerTripRepository
{
    private PDO $pdo;

    private const TABLE = 'customer_trips';
    private static bool $tableEnsured = false;

    /**
     * Consistent set of supported statuses so frontend can map styles.
     */
    private const STATUSES = ['pending', 'booked', 'confirmed', 'ongoing', 'completed', 'cancelled'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    public static function table(): string
    {
        return self::TABLE;
    }

    private function ensureTableExists(): void
    {
        if (self::$tableEnsured) {
            return;
        }
        $table = self::TABLE;
        $statement = $this->pdo->prepare('SHOW TABLES LIKE :table');
        $statement->execute(['table' => $table]);
        if ($statement->fetchColumn()) {
            self::$tableEnsured = true;
            return;
        }

        $sql = sprintf(
            'CREATE TABLE `%s` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `nama` VARCHAR(255) NOT NULL,
                `status` VARCHAR(255) NOT NULL DEFAULT \'pending\',
                `kode_booking` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
            $table
        );
        $this->pdo->exec($sql);
        self::$tableEnsured = true;
    }

    public static function allowedStatuses(): array
    {
        return self::STATUSES;
    }

    public static function normalizeStatus(?string $status): string
    {
        $value = strtolower(trim((string) $status));
        if ($value === '') {
            return 'pending';
        }
        $value = str_replace([' ', '-'], '_', $value);
        foreach (self::STATUSES as $allowed) {
            if ($value === $allowed) {
                return $allowed;
            }
        }
        return 'pending';
    }

    public function all(array $filters = []): array
    {
        $conditions = [];
        $params = [];

        if (!empty($filters['nama'])) {
            $conditions[] = '`nama` LIKE :nama';
            $params['nama'] = '%' . $filters['nama'] . '%';
        }

        if (!empty($filters['kode_booking'])) {
            $conditions[] = '`kode_booking` LIKE :kode_booking';
            $params['kode_booking'] = '%' . strtoupper($filters['kode_booking']) . '%';
        }

        if (!empty($filters['status'])) {
            $conditions[] = '`status` = :status';
            $params['status'] = self::normalizeStatus($filters['status']);
        }

        $sql = sprintf(
            'SELECT id, nama, status, kode_booking, created_at, updated_at FROM `%s`',
            self::TABLE
        );

        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY created_at DESC';

        if ($conditions) {
            $statement = $this->pdo->prepare($sql);
            $statement->execute($params);
        } else {
            $statement = $this->pdo->query($sql);
        }

        return $statement->fetchAll() ?: [];
    }

    public function find(int $id): ?array
    {
        $statement = $this->pdo->prepare(sprintf(
            'SELECT id, nama, status, kode_booking, created_at, updated_at FROM `%s` WHERE id = :id LIMIT 1',
            self::TABLE
        ));
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row ?: null;
    }

    public function findByBookingCode(string $code): ?array
    {
        $normalized = strtoupper(trim($code));
        if ($normalized === '') {
            return null;
        }
        $statement = $this->pdo->prepare(sprintf(
            'SELECT id, nama, status, kode_booking, created_at, updated_at FROM `%s` WHERE UPPER(kode_booking) = :code LIMIT 1',
            self::TABLE
        ));
        $statement->execute(['code' => $normalized]);
        $row = $statement->fetch();
        return $row ?: null;
    }

    public function create(string $nama, string $kodeBooking, ?string $status = null): array
    {
        $now = date('Y-m-d H:i:s');
        $normalizedStatus = self::normalizeStatus($status);
        $statement = $this->pdo->prepare(sprintf(
            'INSERT INTO `%s` (nama, status, kode_booking, created_at, updated_at) VALUES (:nama, :status, :kode_booking, :created_at, :updated_at)',
            self::TABLE
        ));
        $statement->execute([
            'nama' => $nama,
            'status' => $normalizedStatus,
            'kode_booking' => $kodeBooking,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $id = (int) $this->pdo->lastInsertId();
        return $this->find($id) ?? [
            'id' => $id,
            'nama' => $nama,
            'kode_booking' => $kodeBooking,
            'status' => $normalizedStatus,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    public function update(int $id, array $attributes): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (array_key_exists('nama', $attributes)) {
            $fields[] = '`nama` = :nama';
            $params['nama'] = $attributes['nama'];
        }

        if (array_key_exists('kode_booking', $attributes)) {
            $fields[] = '`kode_booking` = :kode_booking';
            $params['kode_booking'] = $attributes['kode_booking'];
        }

        if (array_key_exists('status', $attributes)) {
            $fields[] = '`status` = :status';
            $params['status'] = self::normalizeStatus($attributes['status']);
        }

        if (!$fields) {
            return $this->find($id);
        }

        $fields[] = '`updated_at` = :updated_at';
        $params['updated_at'] = date('Y-m-d H:i:s');

        $statement = $this->pdo->prepare(sprintf(
            'UPDATE `%s` SET %s WHERE `id` = :id',
            self::TABLE,
            implode(', ', $fields)
        ));
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare(sprintf(
            'DELETE FROM `%s` WHERE `id` = :id',
            self::TABLE
        ));
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }
}
