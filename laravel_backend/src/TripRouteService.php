<?php

declare(strict_types=1);

namespace Mostycom;

use PDO;
use RuntimeException;

class TripRouteService
{
    private const SCHEDULE_STATUSES = ['open', 'full', 'closed', 'waitlist'];

    /**
     * @throws RuntimeException
     */
    public static function normalizeRoutesPayload($routesPayload): array
    {
        if (!is_array($routesPayload) || !$routesPayload) {
            throw new RuntimeException('Minimal 1 rute harus diisi.');
        }

        $normalized = [];

        foreach ($routesPayload as $index => $routePayload) {
            if (!is_array($routePayload)) {
                continue;
            }

            $name = trim((string) ($routePayload['nama_rute'] ?? ''));
            if ($name === '') {
                throw new RuntimeException('Nama rute wajib diisi pada rute #' . ($index + 1));
            }

            $kapasitas = self::toPositiveInt($routePayload['kapasitas'] ?? 0);
            $slotRoute = self::toPositiveInt($routePayload['slot_tersedia'] ?? $kapasitas);

            $normalized[] = [
                'nama_rute' => $name,
                'deskripsi_rute' => trim((string) ($routePayload['deskripsi_rute'] ?? '')),
                'durasi' => trim((string) ($routePayload['durasi'] ?? '')),
                'harga' => trim((string) ($routePayload['harga'] ?? '')),
                'kapasitas' => $kapasitas,
                'slot_tersedia' => $slotRoute,
                'schedules' => self::normalizeSchedulesPayload($routePayload['schedules'] ?? []),
            ];
        }

        if (!$normalized) {
            throw new RuntimeException('Data rute tidak valid.');
        }

        return $normalized;
    }

    private static function normalizeSchedulesPayload($schedulesPayload): array
    {
        if (!is_array($schedulesPayload)) {
            return [];
        }

        $normalized = [];

        foreach ($schedulesPayload as $schedulePayload) {
            if (!is_array($schedulePayload)) {
                continue;
            }

            $start = self::normalizeDate($schedulePayload['tanggal_mulai'] ?? '');
            if (!$start) {
                continue;
            }

            $end = self::normalizeDate($schedulePayload['tanggal_selesai'] ?? '');
            $quota = self::toPositiveInt($schedulePayload['kuota'] ?? 0);
            $slot = self::toPositiveInt($schedulePayload['slot_tersedia'] ?? $quota);
            $status = strtolower(trim((string) ($schedulePayload['status'] ?? 'open')));
            if (!in_array($status, self::SCHEDULE_STATUSES, true)) {
                $status = 'open';
            }

            $normalized[] = [
                'tanggal_mulai' => $start,
                'tanggal_selesai' => $end,
                'kuota' => $quota,
                'slot_tersedia' => $slot,
                'status' => $status,
            ];
        }

        return $normalized;
    }

    private static function normalizeDate(?string $date): ?string
    {
        $value = trim((string) $date);
        if ($value === '') {
            return null;
        }

        $timestamp = strtotime($value);
        if ($timestamp === false) {
            return null;
        }

        return date('Y-m-d', $timestamp);
    }

    private static function toPositiveInt($value): int
    {
        $intValue = (int) $value;
        return $intValue > 0 ? $intValue : 0;
    }

    public static function saveRoutes(PDO $pdo, int $tripId, array $routes): void
    {
        $now = date('Y-m-d H:i:s');
        $routeInsert = $pdo->prepare(
            'INSERT INTO trip_routes (trip_id, nama_rute, deskripsi_rute, durasi, harga, kapasitas, slot_tersedia, created_at, updated_at)
             VALUES (:trip_id, :nama_rute, :deskripsi_rute, :durasi, :harga, :kapasitas, :slot_tersedia, :created_at, :updated_at)'
        );

        $scheduleInsert = $pdo->prepare(
            'INSERT INTO trip_route_schedules (route_id, tanggal_mulai, tanggal_selesai, kuota, slot_tersedia, status, created_at, updated_at)
             VALUES (:route_id, :tanggal_mulai, :tanggal_selesai, :kuota, :slot_tersedia, :status, :created_at, :updated_at)'
        );

        foreach ($routes as $route) {
            $routeInsert->execute([
                'trip_id' => $tripId,
                'nama_rute' => $route['nama_rute'],
                'deskripsi_rute' => $route['deskripsi_rute'],
                'durasi' => $route['durasi'],
                'harga' => $route['harga'],
                'kapasitas' => $route['kapasitas'],
                'slot_tersedia' => $route['slot_tersedia'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $routeId = (int) $pdo->lastInsertId();

            foreach ($route['schedules'] as $schedule) {
                $scheduleInsert->execute([
                    'route_id' => $routeId,
                    'tanggal_mulai' => $schedule['tanggal_mulai'],
                    'tanggal_selesai' => $schedule['tanggal_selesai'],
                    'kuota' => $schedule['kuota'],
                    'slot_tersedia' => $schedule['slot_tersedia'],
                    'status' => $schedule['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public static function replaceRoutes(PDO $pdo, int $tripId, array $routes): void
    {
        self::deleteRoutesByTrip($pdo, $tripId);
        self::saveRoutes($pdo, $tripId, $routes);
    }

    public static function deleteRoutesByTrip(PDO $pdo, int $tripId): void
    {
        $routeIds = $pdo->prepare('SELECT id FROM trip_routes WHERE trip_id = :trip_id');
        $routeIds->execute(['trip_id' => $tripId]);
        $ids = array_map('intval', $routeIds->fetchAll(PDO::FETCH_COLUMN));

        if ($ids) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $deleteSchedules = $pdo->prepare("DELETE FROM trip_route_schedules WHERE route_id IN ($placeholders)");
            $deleteSchedules->execute($ids);
        }

        $deleteRoutes = $pdo->prepare('DELETE FROM trip_routes WHERE trip_id = :trip_id');
        $deleteRoutes->execute(['trip_id' => $tripId]);
    }

    public static function getRoutesByTripIds(PDO $pdo, array $tripIds): array
    {
        $tripIds = array_values(array_unique(array_map('intval', $tripIds)));
        if (!$tripIds) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($tripIds), '?'));
        $statement = $pdo->prepare(
            "SELECT id, trip_id, nama_rute, deskripsi_rute, durasi, harga, kapasitas, slot_tersedia, created_at, updated_at
             FROM trip_routes
             WHERE trip_id IN ($placeholders)
             ORDER BY trip_id ASC, id ASC"
        );
        $statement->execute($tripIds);
        $routes = $statement->fetchAll();

        if (!$routes) {
            return array_fill_keys($tripIds, []);
        }

        $routeMap = [];
        $grouped = [];
        $routeIds = [];

        foreach ($routes as $route) {
            $route['kapasitas'] = (int) $route['kapasitas'];
            $route['slot_tersedia'] = (int) $route['slot_tersedia'];
            $route['schedules'] = [];
            $routeMap[(int) $route['id']] = $route;
            $grouped[(int) $route['trip_id']][] = &$routeMap[(int) $route['id']];
            $routeIds[] = (int) $route['id'];
        }

        if ($routeIds) {
            $schedulePlaceholders = implode(',', array_fill(0, count($routeIds), '?'));
            $scheduleStatement = $pdo->prepare(
                "SELECT id, route_id, tanggal_mulai, tanggal_selesai, kuota, slot_tersedia, status, created_at, updated_at
                 FROM trip_route_schedules
                 WHERE route_id IN ($schedulePlaceholders)
                 ORDER BY tanggal_mulai ASC, id ASC"
            );
            $scheduleStatement->execute($routeIds);
            $schedules = $scheduleStatement->fetchAll();

            foreach ($schedules as $schedule) {
                $routeId = (int) $schedule['route_id'];
                if (!isset($routeMap[$routeId])) {
                    continue;
                }
                $schedule['kuota'] = (int) $schedule['kuota'];
                $schedule['slot_tersedia'] = (int) $schedule['slot_tersedia'];
                $routeMap[$routeId]['schedules'][] = $schedule;
            }
        }

        foreach ($tripIds as $tripId) {
            if (!isset($grouped[$tripId])) {
                $grouped[$tripId] = [];
            }
        }

        return $grouped;
    }

    public static function getRoutesForTrip(PDO $pdo, int $tripId): array
    {
        $all = self::getRoutesByTripIds($pdo, [$tripId]);
        return $all[$tripId] ?? [];
    }
}
