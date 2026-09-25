<?php

namespace Tests\Feature;

use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Base for admin-gated feature tests (the ibiz_v2 TenantTestCase analogue
 * collapsed to one identity): seeds the admin and issues a fresh bearer token
 * so every write in the subclass is authenticated.
 */
abstract class AdminApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminSeeder::class);
    }

    /** @return array{Authorization: string} */
    protected function adminHeaders(): array
    {
        return ['Authorization' => 'Bearer '.$this->adminToken()];
    }

    protected function adminToken(): string
    {
        return (string) $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'password',
        ])->assertOk()->json('data.token');
    }
}
