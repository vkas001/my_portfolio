<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ThemeSettingTest extends AdminApiTestCase
{
    /** Theme writes are admin-gated; authenticate every write in this file. */
    public function test_theme_round_trips_verbatim(): void
    {
        $payload = [
            'mode' => 'dark',
            'accent' => 'violet',
            'density' => 'comfortable',
            'gridSize' => 32,
            'windowOpacity' => 0.85,
            'showTopBar' => false,
        ];

        $this->putJson('/api/theme', $payload, $this->adminHeaders())->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.exists', true)
            ->assertJsonPath('data.theme.accent', 'violet')
            ->assertJsonPath('data.theme.gridSize', 32);

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.exists', true)
            ->assertJsonPath('data.theme.density', 'comfortable')
            ->assertJsonPath('data.theme.windowOpacity', 0.85);
    }

    public function test_update_merges_into_existing_theme(): void
    {
        $this->putJson('/api/theme', ['mode' => 'light', 'accent' => 'blue'], $this->adminHeaders())->assertOk();
        $this->putJson('/api/theme', ['density' => 'compact'], $this->adminHeaders())->assertOk();

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.mode', 'light')
            ->assertJsonPath('data.theme.density', 'compact');
    }

    public function test_reset_clears_saved_theme(): void
    {
        $this->putJson('/api/theme', ['mode' => 'dark'], $this->adminHeaders())->assertOk();
        $this->deleteJson('/api/theme/reset', [], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.exists', false);

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.exists', false);
    }

    public function test_legacy_startup_windows_are_force_cleared(): void
    {
        $this->putJson('/api/theme', ['startupWindows' => ['about', 'skills']], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.startupWindows', []);

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.startupWindows', []);
    }

    public function test_intentional_startup_windows_are_preserved(): void
    {
        $this->putJson('/api/theme', ['startupWindows' => ['contact']], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.startupWindows', ['contact']);
    }

    public function test_volume_round_trip(): void
    {
        $this->putJson('/api/theme', ['volume' => 30], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.volume', 30);

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.volume', 30);
    }

    public function test_out_of_range_volume_is_rejected(): void
    {
        $this->putJson('/api/theme', ['volume' => 150], $this->adminHeaders())->assertStatus(422);
        $this->putJson('/api/theme', ['volume' => -5], $this->adminHeaders())->assertStatus(422);
    }

    public function test_splash_settings_round_trip(): void
    {
        $payload = [
            'splashWords' => ['Ship', 'fast'],
            'splashTagline' => 'Test tagline',
            'splashFooter' => 'Test footer',
            'splashDuration' => 3000,
            'splashBackground' => 'indigo',
            'splashAccent' => '#a78bfa',
        ];
        $this->putJson('/api/theme', $payload, $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.splashWords', ['Ship', 'fast'])
            ->assertJsonPath('data.theme.splashDuration', 3000)
            ->assertJsonPath('data.theme.splashBackground', 'indigo');

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.splashAccent', '#a78bfa')
            ->assertJsonPath('data.theme.splashFooter', 'Test footer');
    }

    public function test_splash_settings_reject_out_of_range_values(): void
    {
        $this->putJson('/api/theme', ['splashDuration' => 99999], $this->adminHeaders())->assertStatus(422);
        $this->putJson('/api/theme', ['splashDuration' => 500], $this->adminHeaders())->assertStatus(422);
        $this->putJson('/api/theme', ['splashAccent' => 'not-a-color'], $this->adminHeaders())->assertStatus(422);
        $this->putJson('/api/theme', ['splashBackground' => 'rainbow'], $this->adminHeaders())->assertStatus(422);
        $this->putJson('/api/theme', ['splashWords' => ['a', 'b', 'c', 'd', 'e', 'f', 'g']], $this->adminHeaders())->assertStatus(422);
    }

    public function test_splash_cleared_lines_save_as_null(): void
    {
        // Regression: '' arrives as null via the empty-string middleware; the
        // whole save 422d before splashTagline/splashFooter were nullable.
        $this->putJson('/api/theme', ['splashTagline' => '', 'splashFooter' => ''], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.splashTagline', null)
            ->assertJsonPath('data.theme.splashFooter', null);
    }

    public function test_splash_background_image_rejects_off_origin_urls(): void
    {
        $this->putJson('/api/theme', ['splashBackgroundImage' => 'https://evil.example/bg.jpg'], $this->adminHeaders())
            ->assertStatus(422)->assertJsonPath('ok', false);

        $this->putJson('/api/theme', ['splashBackgroundImage' => '/splash/naruto-uzumaki.jpg'], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.splashBackgroundImage', '/splash/naruto-uzumaki.jpg');
    }

    public function test_splash_image_upload_stores_file_and_points_theme_at_it(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/splash-image', [
            'image' => UploadedFile::fake()->image('custom.jpg', 1920, 1080),
        ], $this->adminHeaders())->assertOk()->assertJsonPath('ok', true);

        $url = $this->getJson('/api/theme')->json('data.theme.splashBackgroundImage');
        $this->assertStringStartsWith('/storage/splash/', $url);
        Storage::disk('public')->assertExists(substr($url, strlen('/storage/')));
    }

    public function test_splash_image_replace_deletes_previous_upload(): void
    {
        Storage::fake('public');

        $post = fn (string $name) => $this->post('/api/theme/splash-image', [
            'image' => UploadedFile::fake()->image($name, 1920, 1080),
        ], $this->adminHeaders())->assertOk();

        $post('first.jpg');
        $first = $this->getJson('/api/theme')->json('data.theme.splashBackgroundImage');
        $firstRel = substr($first, strlen('/storage/'));
        Storage::disk('public')->assertExists($firstRel);

        $post('second.jpg');
        $second = $this->getJson('/api/theme')->json('data.theme.splashBackgroundImage');
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($firstRel);
        Storage::disk('public')->assertExists(substr($second, strlen('/storage/')));
    }

    public function test_splash_image_upload_rejects_non_images(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/splash-image', [
            'image' => UploadedFile::fake()->create('evil.php', 10),
        ], $this->adminHeaders())->assertStatus(422)->assertJsonPath('ok', false);

        Storage::disk('public')->assertDirectoryEmpty('splash');
    }

    public function test_splash_image_remove_clears_field_and_file(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/splash-image', [
            'image' => UploadedFile::fake()->image('custom.jpg', 1920, 1080),
        ], $this->adminHeaders())->assertOk();

        $url = $this->getJson('/api/theme')->json('data.theme.splashBackgroundImage');
        $rel = substr($url, strlen('/storage/'));

        $this->deleteJson('/api/theme/splash-image', [], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.splashBackgroundImage', null);

        Storage::disk('public')->assertMissing($rel);
    }

    public function test_unauthorized_splash_image_upload_is_rejected(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/splash-image', [
            'image' => UploadedFile::fake()->image('custom.jpg', 1920, 1080),
        ])->assertUnauthorized()->assertJsonPath('ok', false);
    }

    public function test_wallpaper_image_upload_replace_remove_round_trip(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/wallpaper-image', [
            'image' => UploadedFile::fake()->image('first.jpg', 1920, 1080),
        ], $this->adminHeaders())->assertOk()->assertJsonPath('ok', true);

        $first = $this->getJson('/api/theme')->json('data.theme.wallpaperImage');
        $this->assertStringStartsWith('/storage/wallpapers/', $first);
        $firstRel = substr($first, strlen('/storage/'));
        Storage::disk('public')->assertExists($firstRel);

        $this->post('/api/theme/wallpaper-image', [
            'image' => UploadedFile::fake()->image('second.jpg', 1920, 1080),
        ], $this->adminHeaders())->assertOk();

        $second = $this->getJson('/api/theme')->json('data.theme.wallpaperImage');
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($firstRel);

        $this->deleteJson('/api/theme/wallpaper-image', [], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.wallpaperImage', null);
        Storage::disk('public')->assertMissing(substr($second, strlen('/storage/')));
    }

    public function test_wallpaper_image_upload_rejects_non_images_and_guests(): void
    {
        Storage::fake('public');

        $this->post('/api/theme/wallpaper-image', [
            'image' => UploadedFile::fake()->create('evil.php', 10),
        ], $this->adminHeaders())->assertStatus(422)->assertJsonPath('ok', false);

        $this->post('/api/theme/wallpaper-image', [
            'image' => UploadedFile::fake()->image('custom.jpg', 1920, 1080),
        ])->assertUnauthorized()->assertJsonPath('ok', false);

        $this->putJson('/api/theme', ['wallpaperImage' => 'https://evil.example/bg.jpg'], $this->adminHeaders())
            ->assertStatus(422)->assertJsonPath('ok', false);
    }

    public function test_skills_display_round_trips(): void
    {
        $this->putJson('/api/theme', ['skillsDisplay' => 'cards'], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.skillsDisplay', 'cards');

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.skillsDisplay', 'cards');
    }

    public function test_invalid_skills_display_is_rejected(): void
    {
        $this->putJson('/api/theme', ['skillsDisplay' => 'mosaic'], $this->adminHeaders())->assertStatus(422);
    }

    public function test_font_size_round_trip_and_rejects_unknown(): void
    {
        $this->putJson('/api/theme', ['fontSize' => 'large'], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.theme.fontSize', 'large');

        $this->getJson('/api/theme')->assertOk()
            ->assertJsonPath('data.theme.fontSize', 'large');

        $this->putJson('/api/theme', ['fontSize' => 'huge'], $this->adminHeaders())->assertStatus(422);
    }
}
