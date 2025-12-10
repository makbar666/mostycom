<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;
use RuntimeException;

class TestimonialRepository
{
    /** Nama tabel di database */
    private const TABLE = 'testimoni';

    /** Path URL untuk browser */
    private const UPLOAD_DIR = '/public/uploads/testimonials/';

    /** @var PDO */
    private PDO $pdo;

    /** Hindari pengecekan tabel berulang */
    private static bool $tableEnsured = false;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    /**
     * Path absolut folder upload (otomatis mengikuti Document Root hosting)
     */
    private static function fullUploadPath(): string
    {
        return rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/public/uploads/testimonials/';
    }

    /**
     * Pastikan tabel testimoni sudah ada
     */
    private function ensureTableExists(): void
    {
        if (self::$tableEnsured) {
            return;
        }

        $stmt = $this->pdo->prepare('SHOW TABLES LIKE :t');
        $stmt->execute(['t' => self::TABLE]);

        if ($stmt->fetchColumn()) {
            $this->ensureFotoColumn();
            self::$tableEnsured = true;
            return;
        }

        // Buat tabel jika belum ada
        $sql = sprintf(
            'CREATE TABLE `%s` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `nama` VARCHAR(255) NOT NULL,
                `isi` VARCHAR(255) NOT NULL,
                `rate` TINYINT UNSIGNED NOT NULL DEFAULT 5,
                `foto` VARCHAR(255) NULL,
                `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
            self::TABLE
        );

        $this->pdo->exec($sql);
        self::$tableEnsured = true;
    }

    /**
     * Pastikan kolom foto ada
     */
    private function ensureFotoColumn(): void
    {
        $stmt = $this->pdo->prepare("SHOW COLUMNS FROM `" . self::TABLE . "` LIKE 'foto'");
        $stmt->execute();

        if (!$stmt->fetchColumn()) {
            $this->pdo->exec(
                "ALTER TABLE `" . self::TABLE . "` ADD `foto` VARCHAR(255) NULL AFTER `rate`"
            );
        }
    }

    /**
     * Ambil semua testimoni
     */
    public function list(): array
    {
        $stmt = $this->pdo->query(
            "SELECT id, nama, isi, rate, foto, created_at, updated_at 
             FROM `" . self::TABLE . "` 
             ORDER BY created_at DESC"
        );

        return $stmt->fetchAll() ?: [];
    }

    /**
     * Cari testimoni berdasarkan ID
     */
    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT id, nama, isi, rate, foto, created_at, updated_at 
             FROM `" . self::TABLE . "` 
             WHERE id = :id LIMIT 1"
        );
        $stmt->execute(['id' => $id]);

        return $stmt->fetch() ?: null;
    }

    /**
     * Tambah testimoni baru
     */
    public function create(string $name, string $content, int $rate, ?string $imagePath = null): array
    {
        $now = date('Y-m-d H:i:s');
        $rate = $this->normalizeRate($rate);

        $stmt = $this->pdo->prepare(
            "INSERT INTO `" . self::TABLE . "` 
            (nama, isi, rate, foto, created_at, updated_at) 
            VALUES (:nama, :isi, :rate, :foto, :created_at, :updated_at)"
        );

        $stmt->execute([
            'nama'       => $name,
            'isi'        => $content,
            'rate'       => $rate,
            'foto'       => $imagePath,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $id = (int) $this->pdo->lastInsertId();

        return $this->find($id);
    }

    /**
     * Update testimoni
     */
    public function update(int $id, array $attributes): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($attributes['nama'])) {
            $fields[] = "nama = :nama";
            $params['nama'] = trim($attributes['nama']);
        }

        if (isset($attributes['isi'])) {
            $fields[] = "isi = :isi";
            $params['isi'] = trim($attributes['isi']);
        }

        if (isset($attributes['rate'])) {
            $fields[] = "rate = :rate";
            $params['rate'] = $this->normalizeRate((int)$attributes['rate']);
        }

        if (isset($attributes['foto'])) {
            $fields[] = "foto = :foto";
            $params['foto'] = $attributes['foto'];
        }

        if (!$fields) {
            return $this->find($id);
        }

        $fields[] = "updated_at = :updated_at";
        $params['updated_at'] = date('Y-m-d H:i:s');

        $sql = "UPDATE `" . self::TABLE . "` SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $this->find($id);
    }

    /**
     * Hapus testimoni
     */
    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM `" . self::TABLE . "` WHERE id = :id"
        );

        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Normalisasi rate (1–5)
     */
    private function normalizeRate(int $rate): int
    {
        return max(1, min(5, $rate));
    }

    /**
     * Simpan gambar testimoni (base64)
     */
    public function saveImageFromBase64(?string $base64): ?string
    {
        if (!$base64 || trim($base64) === '') {
            return null;
        }

        if (str_contains($base64, ',')) {
            [$meta, $content] = explode(',', $base64, 2);
        } else {
            $content = $base64;
        }

        $content = str_replace(' ', '+', $content);
        $binary = base64_decode($content, true);

        if ($binary === false) {
            throw new RuntimeException('Gagal memproses foto testimoni');
        }

        $extension = 'jpg';
        if (isset($meta) && preg_match('/data:image\/(\w+);base64/', $meta, $m)) {
            $extension = strtolower($m[1]);
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }
        }

        // FIX TERPENTING: path absolut hosting yang benar
        $uploadPath = self::fullUploadPath();

        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $fileName = 'testimonial_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;

        $fullPath = $uploadPath . $fileName;

        if (file_put_contents($fullPath, $binary) === false) {
            throw new RuntimeException("Gagal menyimpan file ke: {$fullPath}");
        }

        // Path untuk disimpan di database
        return self::UPLOAD_DIR . $fileName;
    }

    /**
     * Build URL untuk ditampilkan ke front-end
     */
    public static function buildImageUrl(?string $path): ?string
    {
        return UrlHelper::buildPublicUrl($path);
    }
}
