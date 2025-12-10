<?php

declare(strict_types=1);

namespace Mostycom;

use RuntimeException;

class TripHelper
{
    public const UPLOADS_RELATIVE_DIR = 'uploads/trips/';
    private const UPLOADS_BASE_DIR = '/home/mosb4829/public_html/public/uploads/trips/';

    private static function ensureUploadsDirectory(): void
    {
        if (!is_dir(self::UPLOADS_BASE_DIR)) {
            mkdir(self::UPLOADS_BASE_DIR, 0755, true);
        }
    }

    public static function saveImage(?string $base64): ?string
    {
        if (!$base64) {
            return null;
        }

        if (str_contains($base64, ',')) {
            [$meta, $content] = explode(',', $base64, 2);
        } else {
            $content = $base64;
            $meta = null;
        }

        $content = str_replace(' ', '+', $content);
        $binary = base64_decode($content, true);

        if ($binary === false) {
            return null;
        }

        $extension = 'jpg';
        if ($meta && preg_match('/data:image\/(\w+);base64/', $meta, $matches)) {
            $extension = strtolower($matches[1]);
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }
        }

        $fileName = 'trip_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;

        self::ensureUploadsDirectory();

        $fullPath = self::UPLOADS_BASE_DIR . $fileName;

        // Simpan file
        file_put_contents($fullPath, $binary);

        // Path yang disimpan ke DB
        return self::UPLOADS_RELATIVE_DIR . $fileName;
    }

    public static function deleteImage(?string $path): void
    {
        if (!$path) {
            return;
        }

        $normalized = trim($path);
        if ($normalized === '') {
            return;
        }

        if (str_starts_with($normalized, self::UPLOADS_RELATIVE_DIR)) {
            $normalized = substr($normalized, strlen(self::UPLOADS_RELATIVE_DIR));
        }

        $normalized = ltrim($normalized, '/');
        if ($normalized === '') {
            return;
        }

        self::ensureUploadsDirectory();
        $fullPath = self::UPLOADS_BASE_DIR . $normalized;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    public static function buildImageUrl(?string $path): ?string
    {
        return UrlHelper::buildPublicUrl($path);
    }
}
