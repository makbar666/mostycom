<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;

class TripPhotoService
{
    private const TABLE = 'trip_photos';

    public static function normalizePhotosPayload($payload): array
    {
        if (!is_array($payload)) {
            return [];
        }

        $normalized = [];
        foreach ($payload as $index => $photo) {
            if (!is_array($photo)) {
                continue;
            }

            $normalized[] = [
                'id' => isset($photo['id']) ? (int) $photo['id'] : null,
                'image_base64' => self::extractBase64($photo),
                'photo_url' => self::sanitizePhotoPath($photo['photo_url'] ?? null),
                'is_primary' => !empty($photo['is_primary']),
                'sort_order' => array_key_exists('sort_order', $photo) ? (int) $photo['sort_order'] : ($index + 1),
            ];
        }

        return $normalized;
    }

    public static function getPhotosByTripIds(PDO $pdo, array $tripIds): array
    {
        $tripIds = array_values(array_unique(array_map('intval', $tripIds)));
        if (!$tripIds) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($tripIds), '?'));
        $statement = $pdo->prepare(
            sprintf(
                'SELECT id, trip_id, photo_url, is_primary, sort_order, created_at, updated_at FROM `%s` WHERE trip_id IN (%s) ORDER BY trip_id ASC, sort_order ASC, id ASC',
                self::TABLE,
                $placeholders
            )
        );
        $statement->execute($tripIds);
        $rows = $statement->fetchAll() ?: [];

        $grouped = [];
        foreach ($tripIds as $tripId) {
            $grouped[$tripId] = [];
        }

        foreach ($rows as $row) {
            $tripId = (int) $row['trip_id'];
            $photo = [
                'id' => (int) $row['id'],
                'trip_id' => $tripId,
                'photo_url' => $row['photo_url'],
                'photo_full_url' => TripHelper::buildImageUrl($row['photo_url'] ?? null),
                'is_primary' => (bool) $row['is_primary'],
                'sort_order' => (int) $row['sort_order'],
                'created_at' => $row['created_at'] ?? null,
                'updated_at' => $row['updated_at'] ?? null,
            ];
            $grouped[$tripId][] = $photo;
        }

        return $grouped;
    }

    public static function getPhotosForTrip(PDO $pdo, int $tripId): array
    {
        $all = self::getPhotosByTripIds($pdo, [$tripId]);
        return $all[$tripId] ?? [];
    }

    public static function syncPhotos(PDO $pdo, int $tripId, array $photos): array
    {
        $photos = array_values($photos);
        if (!$photos) {
            self::deletePhotosByTrip($pdo, $tripId);
            return [];
        }

        $hasPrimary = false;
        foreach ($photos as $photo) {
            if (!empty($photo['is_primary'])) {
                $hasPrimary = true;
                break;
            }
        }
        if (!$hasPrimary && isset($photos[0])) {
            $photos[0]['is_primary'] = true;
        }

        usort($photos, static function ($a, $b) {
            return ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0);
        });

        $existingStatement = $pdo->prepare(
            sprintf('SELECT id, photo_url FROM `%s` WHERE trip_id = :trip_id', self::TABLE)
        );
        $existingStatement->execute(['trip_id' => $tripId]);
        $existingRows = $existingStatement->fetchAll() ?: [];
        $existingMap = [];
        foreach ($existingRows as $row) {
            $existingMap[(int) $row['id']] = $row;
        }

        $now = date('Y-m-d H:i:s');
        $update = $pdo->prepare(
            sprintf(
                'UPDATE `%s` SET is_primary = :is_primary, sort_order = :sort_order, updated_at = :updated_at WHERE id = :id',
                self::TABLE
            )
        );
        $insert = $pdo->prepare(
            sprintf(
                'INSERT INTO `%s` (trip_id, photo_url, is_primary, sort_order, created_at, updated_at) VALUES (:trip_id, :photo_url, :is_primary, :sort_order, :created_at, :updated_at)',
                self::TABLE
            )
        );
        $delete = $pdo->prepare(sprintf('DELETE FROM `%s` WHERE id = :id', self::TABLE));

        $primaryPath = null;

        foreach ($photos as $index => $photo) {
            $sortOrder = $index + 1;
            $isPrimary = !empty($photo['is_primary']);
            $photoId = isset($photo['id']) ? (int) $photo['id'] : null;

            if ($photoId && isset($existingMap[$photoId])) {
                $update->execute([
                    'is_primary' => $isPrimary ? 1 : 0,
                    'sort_order' => $sortOrder,
                    'updated_at' => $now,
                    'id' => $photoId,
                ]);

                $path = $existingMap[$photoId]['photo_url'] ?? null;
                if ($isPrimary && !$primaryPath && $path) {
                    $primaryPath = $path;
                }

                unset($existingMap[$photoId]);
                continue;
            }

            $storedPath = null;
            if (!empty($photo['image_base64']) && is_string($photo['image_base64'])) {
                $storedPath = TripHelper::saveImage($photo['image_base64']);
            } elseif (!empty($photo['photo_url']) && is_string($photo['photo_url'])) {
                $storedPath = self::sanitizePhotoPath($photo['photo_url']);
            }

            if (!$storedPath) {
                continue;
            }

            $insert->execute([
                'trip_id' => $tripId,
                'photo_url' => $storedPath,
                'is_primary' => $isPrimary ? 1 : 0,
                'sort_order' => $sortOrder,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            if ($isPrimary && !$primaryPath) {
                $primaryPath = $storedPath;
            }
        }

        if (!empty($existingMap)) {
            foreach ($existingMap as $id => $row) {
                $delete->execute(['id' => $id]);
                TripHelper::deleteImage($row['photo_url'] ?? null);
            }
        }

        $finalPhotos = self::getPhotosForTrip($pdo, $tripId);
        if (!$primaryPath && isset($finalPhotos[0])) {
            $primaryPath = $finalPhotos[0]['photo_url'] ?? null;
        }

        self::updateTripCover($pdo, $tripId, $primaryPath);

        return $finalPhotos;
    }

    public static function deletePhotosByTrip(PDO $pdo, int $tripId): void
    {
        $statement = $pdo->prepare(
            sprintf('SELECT id, photo_url FROM `%s` WHERE trip_id = :trip_id', self::TABLE)
        );
        $statement->execute(['trip_id' => $tripId]);
        $rows = $statement->fetchAll() ?: [];
        if ($rows) {
            $delete = $pdo->prepare(sprintf('DELETE FROM `%s` WHERE trip_id = :trip_id', self::TABLE));
            $delete->execute(['trip_id' => $tripId]);
            foreach ($rows as $row) {
                TripHelper::deleteImage($row['photo_url'] ?? null);
            }
        }

        self::updateTripCover($pdo, $tripId, null);
    }

    public static function buildLegacyPhotos(?string $path): array
    {
        $sanitized = self::sanitizePhotoPath($path);
        if (!$sanitized) {
            return [];
        }

        return [[
            'id' => null,
            'trip_id' => null,
            'photo_url' => $sanitized,
            'photo_full_url' => TripHelper::buildImageUrl($sanitized),
            'is_primary' => true,
            'sort_order' => 1,
            'is_legacy' => true,
        ]];
    }

    private static function extractBase64(array $photo): ?string
    {
        foreach (['image_base64', 'photo_base64'] as $key) {
            if (!empty($photo[$key]) && is_string($photo[$key])) {
                return $photo[$key];
            }
        }
        return null;
    }

    private static function sanitizePhotoPath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $trimmed = trim($path);
        if ($trimmed === '') {
            return null;
        }

        $normalized = ltrim($trimmed, '/');
        if (str_starts_with($normalized, 'public/')) {
            $normalized = substr($normalized, strlen('public/'));
        }

        if (!str_starts_with($normalized, TripHelper::UPLOADS_RELATIVE_DIR)) {
            return null;
        }

        $relative = substr($normalized, strlen(TripHelper::UPLOADS_RELATIVE_DIR));
        $relative = ltrim($relative, '/');
        if ($relative === '') {
            return null;
        }

        return TripHelper::UPLOADS_RELATIVE_DIR . $relative;
    }

    private static function updateTripCover(PDO $pdo, int $tripId, ?string $path): void
    {
        $statement = $pdo->prepare('UPDATE trips SET gambar = :gambar WHERE id = :id');
        $statement->execute([
            'gambar' => $path,
            'id' => $tripId,
        ]);
    }
}

