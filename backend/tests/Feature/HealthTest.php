<?php

namespace Tests\Feature;

use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_reports_up_and_the_database_state(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.status', 'up')
            ->assertJsonPath('data.database', 'up')
            ->assertJsonStructure(['data' => ['status', 'uptime', 'database']]);
    }

    public function test_health_stays_ok_when_the_database_is_unreachable(): void
    {
        // The probe must never 500: the taskbar and tray poll it, and the whole
        // point is to report a DB outage instead of dying with it.
        DB::shouldReceive('connection')->andThrow(new QueryException('simulated outage', '', [], new Exception('down')));

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('data.status', 'degraded')
            ->assertJsonPath('data.database', 'down');
    }

    public function test_health_is_exempt_from_the_api_rate_limiter(): void
    {
        // The limiter is backed by the cache store, so a throttled probe would
        // inherit the database outage it is meant to report on. The frontend
        // polls /api/health from both the taskbar and the tray, so it must stay
        // answerable well past the 120/min api budget.
        for ($i = 0; $i < 121; $i++) {
            $this->getJson('/api/health')->assertOk();
        }
    }

    public function test_public_endpoints_are_still_rate_limited(): void
    {
        $tooMany = 0;

        for ($i = 0; $i < 121; $i++) {
            $response = $this->getJson('/api/theme');

            if ($response->status() === 429) {
                $tooMany++;
            }
        }

        $this->assertSame(1, $tooMany, 'Expected /api/theme to start returning 429 after the api budget is spent.');
    }
}
