<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * RBAC gate on admin-only routes (permission: middleware → users.is_admin).
 * Guests → 401 (auth:api), signed-in non-admin → 403, admin → 200.
 */
class RbacAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_gets_401_on_admin_routes(): void
    {
        $this->postJson('/api/admin/skills', [
            'id' => 'x', 'name' => 'X', 'category' => 'tools', 'proficiency' => 50,
        ])->assertUnauthorized()->assertJsonPath('ok', false);

        $this->putJson('/api/theme', ['mode' => 'dark'])
            ->assertUnauthorized()->assertJsonPath('ok', false);
    }

    public function test_non_admin_signed_in_user_gets_403(): void
    {
        $user = User::factory()->create(); // is_admin defaults to false

        $this->actingAs($user, 'api')
            ->postJson('/api/admin/projects', [
                'id' => 'p', 'title' => 'T', 'description' => 'd', 'category' => 'Web App', 'year' => 2026,
            ])
            ->assertForbidden()
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'Forbidden.');

        $this->actingAs($user, 'api')
            ->putJson('/api/theme', ['mode' => 'dark'])
            ->assertForbidden()
            ->assertJsonPath('error', 'Forbidden.');

        $this->actingAs($user, 'api')
            ->deleteJson('/api/admin/experience/nope')
            ->assertForbidden();
    }

    public function test_admin_token_passes_the_permission_gate(): void
    {
        $headers = ['Authorization' => 'Bearer '.$this->adminToken()];

        $this->postJson('/api/admin/skills', [
            'id' => 'allowed', 'name' => 'Go', 'category' => 'languages', 'proficiency' => 90,
        ], $headers)->assertOk()->assertJsonPath('data.id', 'allowed');

        $this->putJson('/api/theme', ['mode' => 'dark'], $headers)
            ->assertOk()->assertJsonPath('data.theme.mode', 'dark');
    }

    private function adminToken(): string
    {
        $this->seed(AdminSeeder::class);

        return (string) $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'password',
        ])->json('data.token');
    }
}
