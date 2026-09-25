<?php

namespace App\Services\Theme;

use App\Models\ThemeSetting;

/**
 * Single-user theme persistence (ibiz_v2 OsPersonalizationService collapsed
 * to one global row — never scope per-user; stale legacy values normalized).
 */
class ThemeService
{
    /** Legacy default that must never auto-open again (force-cleared once). */
    private const LEGACY_STARTUP = ['about', 'skills'];

    /** @return array{theme: ?array, exists: bool} */
    public function current(): array
    {
        $row = ThemeSetting::query()->first();
        $settings = $row?->settings;

        if (is_array($settings) && $this->isLegacyStartup($settings['startupWindows'] ?? null)) {
            $settings['startupWindows'] = [];
        }

        return ['theme' => $settings, 'exists' => $row !== null];
    }

    /** @return array{theme: array, exists: bool} */
    public function apply(array $validated): array
    {
        $existing = ThemeSetting::query()->first();
        $merged = array_merge($existing?->settings ?? [], $validated);
        if ($this->isLegacyStartup($merged['startupWindows'] ?? null)) {
            $merged['startupWindows'] = [];
        }

        $row = ThemeSetting::query()->updateOrCreate(
            ['id' => $existing?->id ?? 1],
            ['settings' => $merged]
        );

        return ['theme' => $row->settings, 'exists' => true];
    }

    /** @return array{theme: null, exists: bool} */
    public function reset(): array
    {
        ThemeSetting::query()->delete();

        return ['theme' => null, 'exists' => false];
    }

    private function isLegacyStartup(mixed $value): bool
    {
        if (! is_array($value) || count($value) !== count(self::LEGACY_STARTUP)) {
            return false;
        }
        foreach (self::LEGACY_STARTUP as $id) {
            if (! in_array($id, $value, true)) {
                return false;
            }
        }

        return true;
    }
}
