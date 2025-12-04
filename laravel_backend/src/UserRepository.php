<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;
use PDOException;
use RuntimeException;

class UserRepository
{
    public const DEFAULT_ROLE = 'CMS User';

    private PDO $pdo;
    private bool $hasRoleColumn;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->hasRoleColumn = $this->columnExists('role');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $columns = $this->selectColumns();
        $statement = $this->pdo->query(sprintf('SELECT %s FROM users ORDER BY created_at DESC', $columns));
        $rows = $statement->fetchAll() ?: [];
        return array_map(fn (array $row): array => $this->transformUser($row), $rows);
    }

    public function find(int $id): ?array
    {
        $columns = $this->selectColumns();
        $statement = $this->pdo->prepare(sprintf('SELECT %s FROM users WHERE id = :id LIMIT 1', $columns));
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row ? $this->transformUser($row) : null;
    }

    public function emailExists(string $email, ?int $ignoreId = null): bool
    {
        $query = 'SELECT COUNT(1) FROM users WHERE email = :email';
        $params = ['email' => $email];
        if ($ignoreId !== null) {
            $query .= ' AND id <> :id';
            $params['id'] = $ignoreId;
        }
        $statement = $this->pdo->prepare($query);
        $statement->execute($params);
        return (int) $statement->fetchColumn() > 0;
    }

    public function create(string $name, string $email, string $password, ?string $role = null): array
    {
        $now = date('Y-m-d H:i:s');
        $columns = ['name', 'email', 'password', 'created_at', 'updated_at'];
        $values = [
            'name' => $name,
            'email' => $email,
            'password' => $this->hashPassword($password),
            'created_at' => $now,
            'updated_at' => $now,
        ];

        if ($this->hasRoleColumn) {
            $columns[] = 'role';
            $values['role'] = $this->normalizeRole($role);
        }

        $placeholders = array_map(fn (string $column): string => ':' . $column, $columns);
        $sql = sprintf(
            'INSERT INTO users (%s) VALUES (%s)',
            implode(', ', $columns),
            implode(', ', $placeholders)
        );
        $statement = $this->pdo->prepare($sql);
        $statement->execute($values);

        $id = (int) $this->pdo->lastInsertId();
        $user = $this->find($id);
        if (!$user) {
            throw new RuntimeException('Gagal membuat user baru');
        }
        return $user;
    }

    public function update(int $id, array $payload): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (array_key_exists('name', $payload) && $payload['name'] !== null) {
            $fields[] = 'name = :name';
            $params['name'] = $payload['name'];
        }

        if (array_key_exists('email', $payload) && $payload['email'] !== null) {
            $fields[] = 'email = :email';
            $params['email'] = $payload['email'];
        }

        if (array_key_exists('password', $payload) && $payload['password'] !== null) {
            $fields[] = 'password = :password';
            $params['password'] = $this->hashPassword((string) $payload['password']);
        }

        if ($this->hasRoleColumn && array_key_exists('role', $payload) && $payload['role'] !== null) {
            $fields[] = 'role = :role';
            $params['role'] = $this->normalizeRole($payload['role']);
        }

        if (empty($fields)) {
            return $this->find($id);
        }

        $fields[] = 'updated_at = :updated_at';
        $params['updated_at'] = date('Y-m-d H:i:s');

        $sql = sprintf('UPDATE users SET %s WHERE id = :id LIMIT 1', implode(', ', $fields));
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM users WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    private function selectColumns(): string
    {
        $columns = ['id', 'name', 'email', 'created_at', 'updated_at'];
        if ($this->hasRoleColumn) {
            $columns[] = 'role';
        }
        return implode(', ', $columns);
    }

    private function transformUser(array $row): array
    {
        $role = $this->hasRoleColumn ? ($row['role'] ?? null) : null;

        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $this->normalizeRole($role),
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }

    private function normalizeRole(?string $role): string
    {
        $trimmed = trim((string) $role);
        return $trimmed === '' ? self::DEFAULT_ROLE : $trimmed;
    }

    private function columnExists(string $column): bool
    {
        static $cache = [];
        if (array_key_exists($column, $cache)) {
            return $cache[$column];
        }
        try {
            $statement = $this->pdo->prepare('SHOW COLUMNS FROM users LIKE :column');
            $statement->execute(['column' => $column]);
            $cache[$column] = $statement->fetch() !== false;
        } catch (PDOException $exception) {
            $cache[$column] = false;
        }
        return $cache[$column];
    }

    private function hashPassword(string $password): string
    {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        if ($hash === false) {
            throw new RuntimeException('Gagal mengenkripsi password');
        }
        return $hash;
    }
}

