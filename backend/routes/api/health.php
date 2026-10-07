<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
| Health probe. Deliberately exempt from the group-level `throttle:api`: the
| rate limiter is backed by the cache store, so a throttled probe inherits the
| very database outage it should report on (500 instead of a readable
| "degraded"). It reports the DB state instead of throwing, so the frontend
| taskbar/tray poll always gets a 200 with an honest payload. The response is
| still wrapped by the global ApiResponseEnvelope middleware.
*/
Route::get('/health', function () {
    $database = 'up';

    try {
        DB::connection()->getPdo();
    } catch (Throwable) {
        $database = 'down';
    }

    // LARAVEL_START only exists when the process boots through
    // public/index.php or artisan — not under the test runner.
    $uptime = defined('LARAVEL_START') ? round(microtime(true) - LARAVEL_START, 3) : null;

    return response()->json([
        'status' => $database === 'up' ? 'up' : 'degraded',
        'uptime' => $uptime,
        'database' => $database,
    ]);
})->withoutMiddleware('throttle:api');
