<?php

declare(strict_types=1);

namespace Mostycom;

class UrlHelper
{
    public static function buildPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $trimmedPath = trim($path);
        if ($trimmedPath === '') {
            return null;
        }

        // Return early when an absolute URL is already provided.
        if (
            str_starts_with($trimmedPath, 'http://') ||
            str_starts_with($trimmedPath, 'https://') ||
            str_starts_with($trimmedPath, '//')
        ) {
            return $trimmedPath;
        }

        $normalizedPath = '/' . ltrim($trimmedPath, '/');

        $appUrl = rtrim((string) env_value('APP_URL', ''), '/');
        if ($appUrl !== '') {
            return $appUrl . $normalizedPath;
        }

        $detectedBase = self::detectBasePath();
        $host = $_SERVER['HTTP_HOST'] ?? '';

        if ($host !== '') {
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $baseUrl = $scheme . '://' . $host;
            if ($detectedBase !== '') {
                $baseUrl .= $detectedBase;
            }
            return rtrim($baseUrl, '/') . $normalizedPath;
        }

        if ($detectedBase !== '') {
            return rtrim($detectedBase, '/') . $normalizedPath;
        }

        return $normalizedPath;
    }

    private static function detectBasePath(): string
    {
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        if ($scriptName === '') {
            return '';
        }

        $scriptDir = str_replace('\\', '/', dirname($scriptName));
        if ($scriptDir === '.' || $scriptDir === DIRECTORY_SEPARATOR) {
            return '';
        }

        $basePath = preg_replace('#/api.*$#', '', $scriptDir);
        return rtrim($basePath ?? '', '/');
    }
}
