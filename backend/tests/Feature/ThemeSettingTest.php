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
}
