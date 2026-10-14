<?php

namespace Tests\Feature;

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
}
