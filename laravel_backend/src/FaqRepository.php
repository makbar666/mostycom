<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;

class FaqRepository
{
    private const TABLE = 'faq';

    private PDO $pdo;

    private static bool $tableEnsured = false;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    private function ensureTableExists(): void
    {
        if (self::$tableEnsured) {
            return;
        }

        $statement = $this->pdo->prepare('SHOW TABLES LIKE :table');
        $statement->execute(['table' => self::TABLE]);
        if ($statement->fetchColumn()) {
            $this->ensureAutoIncrement();
            self::$tableEnsured = true;
            return;
        }

        $sql = sprintf(
            'CREATE TABLE `%s` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `judul` VARCHAR(255) NOT NULL,
                `isi` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
            self::TABLE
        );
        $this->pdo->exec($sql);
        self::$tableEnsured = true;
    }

    private function ensureAutoIncrement(): void
    {
        $statement = $this->pdo->prepare(sprintf('SHOW COLUMNS FROM `%s` LIKE \'id\'', self::TABLE));
        $statement->execute();
        $column = $statement->fetch(PDO::FETCH_ASSOC);
        if (!$column) {
            $this->pdo->exec(sprintf('ALTER TABLE `%s` ADD `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST', self::TABLE));
            return;
        }
        $extra = strtolower((string) ($column['Extra'] ?? ''));
        if (!str_contains($extra, 'auto_increment')) {
            $this->pdo->exec(sprintf('ALTER TABLE `%s` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT', self::TABLE));
        }
    }

    public function all(): array
    {
        $statement = $this->pdo->query(sprintf(
            'SELECT `id`, `judul`, `isi`, `created_at`, `updated_at` FROM `%s` ORDER BY `created_at` DESC',
            self::TABLE
        ));
        return $statement->fetchAll() ?: [];
    }

    public function find(int $id): ?array
    {
        $statement = $this->pdo->prepare(sprintf(
            'SELECT `id`, `judul`, `isi`, `created_at`, `updated_at` FROM `%s` WHERE `id` = :id LIMIT 1',
            self::TABLE
        ));
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row ?: null;
    }

    public function create(string $title, string $content): array
    {
        $now = date('Y-m-d H:i:s');
        $statement = $this->pdo->prepare(sprintf(
            'INSERT INTO `%s` (`judul`, `isi`, `created_at`, `updated_at`) VALUES (:judul, :isi, :created_at, :updated_at)',
            self::TABLE
        ));
        $statement->execute([
            'judul' => $title,
            'isi' => $content,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $id = (int) $this->pdo->lastInsertId();
        return $this->find($id) ?? [
            'id' => $id,
            'judul' => $title,
            'isi' => $content,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    public function update(int $id, array $attributes): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (array_key_exists('judul', $attributes)) {
            $title = trim((string) $attributes['judul']);
            if ($title === '') {
                return null;
            }
            $fields[] = '`judul` = :judul';
            $params['judul'] = $title;
        }

        if (array_key_exists('isi', $attributes)) {
            $content = trim((string) $attributes['isi']);
            if ($content === '') {
                return null;
            }
            $fields[] = '`isi` = :isi';
            $params['isi'] = $content;
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
