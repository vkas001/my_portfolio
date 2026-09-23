<?php

namespace Tests\Feature;

use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminSeeder::class);
    }

    private function loginToken(): string
    {
        $res = $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('ok', true);

        return $res->json('data.token');
    }

    public function test_login_succeeds_with_seeded_admin_credentials(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.user.email', 'admin')
            ->assertJsonPath('data.user.isAdmin', true)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'wrong',
        ])->assertUnauthorized()
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'Invalid credentials.');
    }

    public function test_login_rejects_unknown_email_with_same_error(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password',
        ])->assertUnauthorized()
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'Invalid credentials.');
    }

    public function test_me_returns_user_with_valid_token(): void
    {
        $this->getJson('/api/auth/me', ['Authorization' => 'Bearer '.$this->loginToken()])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.user.email', 'admin');
    }

    public function test_me_rejects_missing_token(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('ok', false);
    }

    public function test_logout_revokes_the_token(): void
    {
        $token = $this->loginToken();

        $this->postJson('/api/auth/logout', [], ['Authorization' => 'Bearer '.$token])
            ->assertOk()
            ->assertJsonPath('data.signed_out', true);

        $this->getJson('/api/auth/me', ['Authorization' => 'Bearer '.$token])
            ->assertUnauthorized();
    }

    public function test_theme_read_stays_public_but_writes_require_auth(): void
    {
        $this->getJson('/api/theme')->assertOk();

        $this->putJson('/api/theme', ['mode' => 'dark'])
            ->assertUnauthorized()
            ->assertJsonPath('ok', false);

        $this->deleteJson('/api/theme/reset')
            ->assertUnauthorized()
            ->assertJsonPath('ok', false);
    }

    public function test_theme_writes_succeed_with_admin_token(): void
    {
        $headers = ['Authorization' => 'Bearer '.$this->loginToken()];

        $this->putJson('/api/theme', ['mode' => 'dark'], $headers)
            ->assertOk()
            ->assertJsonPath('data.theme.mode', 'dark');

        $this->deleteJson('/api/theme/reset', [], $headers)
            ->assertOk()
            ->assertJsonPath('data.exists', false);
    }
}
