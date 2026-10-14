<?php

namespace App\Services\Theme;

use App\Models\ThemeSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Custom splash backdrop: store the upload under splash/ (single slot —
     * the previous custom file is deleted so uploads don't pile up) and
     * point the theme at it. Returns the merged theme like update().
     *
     * @return array{theme: array, exists: bool}
     */
    public function uploadSplashImage(UploadedFile $image): array
    {
        $this->deleteCustomSplashFile();

        $path = $image->store('splash', 'public');

        return $this->apply(['splashBackgroundImage' => '/storage/'.$path]);
    }

    /**
     * Remove the custom backdrop file (if ours) and fall back to the
     * gradient preset (splashBackgroundImage = null).
     *
     * @return array{theme: array, exists: bool}
     */
    public function removeSplashImage(): array
    {
        $this->deleteCustomSplashFile();

        return $this->apply(['splashBackgroundImage' => null]);
    }

    /** Delete the stored custom splash file, if the theme points at one of ours. */
    private function deleteCustomSplashFile(): void
    {
        $this->deleteCustomFile('splashBackgroundImage', 'splash/');
    }

    /**
     * Custom desktop wallpaper photo: store the upload under wallpapers/
     * (single slot — the previous custom file is deleted) and point the
     * theme at it. Returns the merged theme like update().
     *
     * @return array{theme: array, exists: bool}
     */
    public function uploadWallpaperImage(UploadedFile $image): array
    {
        $this->deleteCustomWallpaperFile();

        $path = $image->store('wallpapers', 'public');

        return $this->apply(['wallpaperImage' => '/storage/'.$path]);
    }

    /**
     * Remove the custom wallpaper file (if ours) and fall back to the
     * preset id (wallpaperImage = null).
     *
     * @return array{theme: array, exists: bool}
     */
    public function removeWallpaperImage(): array
    {
        $this->deleteCustomWallpaperFile();

        return $this->apply(['wallpaperImage' => null]);
    }

    /** Delete the stored custom wallpaper file, if the theme points at one of ours. */
    private function deleteCustomWallpaperFile(): void
    {
        $this->deleteCustomFile('wallpaperImage', 'wallpapers/');
    }

    /** Delete a stored upload when the theme field points inside our dir. */
    private function deleteCustomFile(string $field, string $dir): void
    {
        $settings = ThemeSetting::query()->first()?->settings ?? [];
        $old = $settings[$field] ?? null;
        if (! is_string($old)) {
            return;
        }
        $marker = '/storage/';
        $pos = strpos($old, $marker);
        if ($pos === false) {
            return;
        }
        $rel = substr($old, $pos + strlen($marker));
        if (str_starts_with($rel, $dir)) {
            Storage::disk('public')->delete($rel);
        }
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
