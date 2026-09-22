<?php

namespace App\Http\Controllers;

use App\Models\ThemeSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Single-user theme persistence (simplified ibiz_v2 OsPersonalizationController).
 * ibiz scopes by tenant_id/user_id/auth_mode; portfolio keeps one row.
 */
class ThemeController extends Controller
{
    /** Legacy default that must never auto-open again (force-cleared once). */
    private const LEGACY_STARTUP = ['about', 'skills'];

    public function show(): JsonResponse
    {
        $row = ThemeSetting::query()->first();
        $settings = $row?->settings;
        if (is_array($settings) && $this->isLegacyStartup($settings['startupWindows'] ?? null)) {
            $settings['startupWindows'] = [];
        }

        return response()->json([
            'ok' => true,
            'data' => [
                'theme' => $settings,
                'exists' => $row !== null,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['sometimes', 'string', 'in:light,dark'],
            'accent' => ['sometimes', 'string'],
            'customAccent' => ['sometimes', 'nullable', 'string', 'max:20'],
            'glass' => ['sometimes', 'string', 'in:subtle,normal,strong'],
            'blur' => ['sometimes', 'string', 'in:normal,high,ultra'],
            'radius' => ['sometimes', 'string', 'in:sharp,rounded,pill'],
            'font' => ['sometimes', 'string', 'max:40'],
            'density' => ['sometimes', 'string', 'in:compact,normal,comfortable'],
            'gridSize' => ['sometimes', 'integer', 'in:16,24,32'],
            'windowOpacity' => ['sometimes', 'numeric', 'min:0.5', 'max:1'],
            'showTopBar' => ['sometimes', 'boolean'],
            'wallpaper' => ['sometimes', 'string', 'max:60'],
            'wallpaperDim' => ['sometimes', 'numeric', 'min:0', 'max:60'],
            'wallpaperBlur' => ['sometimes', 'numeric', 'min:0', 'max:25'],
            'taskbarMode' => ['sometimes', 'string', 'in:always,auto-hide'],
            'taskbarStyle' => ['sometimes', 'string', 'in:macos,windows'],
            'taskbarApps' => ['sometimes', 'array'],
            'showHomeIndicator' => ['sometimes', 'boolean'],
            'showSeconds' => ['sometimes', 'boolean'],
            'animationsEnabled' => ['sometimes', 'boolean'],
            'soundsEnabled' => ['sometimes', 'boolean'],
            'widgets' => ['sometimes', 'array'],
            'startupWindows' => ['sometimes', 'array'],
            'clockFormat' => ['sometimes', 'string', 'in:12h,24h'],
            'dateFormat' => ['sometimes', 'string', 'in:short,long'],
        ]);

        $existing = ThemeSetting::query()->first();
        $merged = array_merge($existing?->settings ?? [], $validated);
        if ($this->isLegacyStartup($merged['startupWindows'] ?? null)) {
            $merged['startupWindows'] = [];
        }

        $row = ThemeSetting::query()->updateOrCreate(
            ['id' => $existing?->id ?? 1],
            ['settings' => $merged]
        );

        return response()->json([
            'ok' => true,
            'data' => ['theme' => $row->settings, 'exists' => true],
        ]);
    }

    public function reset(): JsonResponse
    {
        ThemeSetting::query()->delete();

        return response()->json([
            'ok' => true,
            'data' => ['theme' => null, 'exists' => false],
        ]);
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
