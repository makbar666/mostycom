<?php

declare(strict_types=1);

namespace Mostycom;

use RuntimeException;

class ArticleHelper
{
    public static function saveImage(?string $base64): ?string
    {
        if (!$base64) {
            return null;
        }

        $base64 = trim($base64);
        if ($base64 === '') {
            return null;
        }

        // Pisahkan meta + content base64
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

        // Tentukan extension
        $extension = 'jpg';
        if ($meta && preg_match('/data:image\/(\w+);base64/', $meta, $matches)) {
            $extension = strtolower($matches[1]);
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }
        }

        // Generate nama file unik
        $fileName = 'article_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;

        /*
        |--------------------------------------------------------------------------
        | FIX PENTING: Gunakan path ABSOLUT sesuai hosting kamu
        |--------------------------------------------------------------------------
        */
        $baseDir = '/home/mosb4829/public_html/public/uploads/articles/';

        // Pastikan folder ada
        if (!is_dir($baseDir)) {
            mkdir($baseDir, 0755, true);
        }

        // Path penyimpanan
        $fullPath = $baseDir . $fileName;

        // Simpan file
        file_put_contents($fullPath, $binary);

        // Path yang masuk ke database
        return 'uploads/articles/' . $fileName;
    }


    public static function buildImageUrl(?string $path): ?string
    {
        return UrlHelper::buildPublicUrl($path);
    }
}
