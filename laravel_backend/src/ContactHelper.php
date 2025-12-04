<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;
use RuntimeException;

class ContactHelper
{
    public static function tableName(): string
    {
        return env_value('CONTACT_TABLE', 'profile_section');
    }

    /*
    |--------------------------------------------------------------------------
    | Resolusi kolom tabel
    |--------------------------------------------------------------------------
    */
    public static function resolveColumns(PDO $pdo): array
    {
        $table = self::tableName();
        $statement = $pdo->query(sprintf('SHOW COLUMNS FROM `%s`', $table));
        $available = [];

        foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $column) {
            $available[$column['Field']] = true;
        }

        $resolver = static function (string $preferred, array $alternatives = []) use ($available, $table): string {
            if (isset($available[$preferred])) {
                return $preferred;
            }
            foreach ($alternatives as $alternative) {
                if (isset($available[$alternative])) {
                    return $alternative;
                }
            }
            throw new RuntimeException("Kolom \"$preferred\" tidak ditemukan pada tabel $table");
        };

        return [
            'title'        => $resolver('judul_section'),
            'description'  => $resolver('deskripsi_singkat', ['deskripsi_singk']),
            'hours'        => $resolver('jam_operasional', ['jam_operasiona']),
            'email'        => $resolver('email'),
            'phone'        => $resolver('telepon'),
            'address'      => $resolver('alamat_lengkap'),
            'lat'          => $resolver('latitude', ['lat']),
            'lng'          => $resolver('longitude', ['lng']),
            'vision'       => $resolver('visi'),
            'mission'      => $resolver('misi'),
            'trust_score'  => $resolver('trush_score', ['trust_score']),
            'review'       => $resolver('ulasan'),
            'header_image' => $resolver('image_header', ['header_image']),
            'trust_image'  => $resolver('image_trush_score', ['image_trust_score', 'trust_image']),
            'whatsapp'     => $resolver('no_wa', ['whatsapp', 'wa']),
            'about'        => $resolver('deskripsi_about', ['about_description', 'about']),
            'about_title'  => $resolver('judul_about', ['about_title']),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | SELECT helper
    |--------------------------------------------------------------------------
    */
    public static function selectColumns(array $columns): string
    {
        $select = ['`id`'];
        foreach ($columns as $alias => $column) {
            $select[] = "`$column` AS `$alias`";
        }
        $select[] = '`created_at`';
        $select[] = '`updated_at`';
        return implode(', ', $select);
    }

    /*
    |--------------------------------------------------------------------------
    | DETEKSI BASE64
    |--------------------------------------------------------------------------
    */
    private static function isBase64(?string $string): bool
    {
        if (!$string || !is_string($string)) {
            return false;
        }
        return str_starts_with($string, 'data:image');
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALISASI INPUT + auto convert base64
    |--------------------------------------------------------------------------
    */
    public static function normalizePayload(array $input): array
    {
        return [
            'title'       => trim((string) ($input['title'] ?? '')),
            'description' => trim((string) ($input['description'] ?? '')),
            'hours'       => trim((string) ($input['hours'] ?? '')),
            'email'       => trim((string) ($input['email'] ?? '')),
            'phone'       => trim((string) ($input['phone'] ?? '')),
            'address'     => trim((string) ($input['address'] ?? '')),
            'lat'         => trim((string) ($input['lat'] ?? '')),
            'lng'         => trim((string) ($input['lng'] ?? '')),
            'vision'      => trim((string) ($input['vision'] ?? '')),
            'mission'     => trim((string) ($input['mission'] ?? '')),
            'trust_score' => trim((string) ($input['trust_score'] ?? '')),
            'review'      => trim((string) ($input['review'] ?? '')),

            // BASE64 → FILE
            'header_image' => self::isBase64($input['header_image_base64'] ?? '')
    ? self::saveHeaderImage($input['header_image_base64'])
    : ($input['header_image'] ?? ''),

'trust_image' => self::isBase64($input['trust_image_base64'] ?? '')
    ? self::saveTrustImage($input['trust_image_base64'])
    : ($input['trust_image'] ?? ''),


            'whatsapp'    => trim((string) ($input['whatsapp'] ?? '')),
            'about'       => trim((string) ($input['about'] ?? '')),
            'about_title' => trim((string) ($input['about_title'] ?? '')),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Convert BASE64 ke file fisik
    |--------------------------------------------------------------------------
    */
    private static function saveBase64Image(?string $base64, string $prefix): ?string
    {
        if (!$base64) return null;

        $base64 = trim($base64);

        if (str_contains($base64, ',')) {
            [, $content] = explode(',', $base64, 2);
        } else {
            $content = $base64;
        }

        $binary = base64_decode($content, true);

        if ($binary === false) {
            throw new RuntimeException('Gagal decode base64 image');
        }

        // extension
        $extension = 'jpg';
        if (preg_match('/data:image\/(\w+);base64/', $base64, $m)) {
            $extension = strtolower($m[1] === 'jpeg' ? 'jpg' : $m[1]);
        }

        // nama file
        $fileName = "{$prefix}_" . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . ".$extension";

        // lokasi fisik server
        $uploadDir = "/home/mosb4829/public_html/public/uploads/contact/";

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        file_put_contents($uploadDir . $fileName, $binary);

        // path yang disimpan ke database (BENAR)
        return "uploads/contact/$fileName";
    }

    public static function saveHeaderImage(?string $b64): ?string
    {
        return self::saveBase64Image($b64, 'contact_header');
    }

    public static function saveTrustImage(?string $b64): ?string
    {
        return self::saveBase64Image($b64, 'contact_trust');
    }

    /*
    |--------------------------------------------------------------------------
    | Build URL
    |--------------------------------------------------------------------------
    */
public static function buildHeaderImageUrl(?string $path): ?string
{
    if (!$path) return null;

    // Tambahkan prefix /public/
    return '/public/' . ltrim($path, '/');
}

public static function buildTrustImageUrl(?string $path): ?string
{
    if (!$path) return null;

    return '/public/' . ltrim($path, '/');
}


}
