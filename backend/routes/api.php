<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\GitHubController;
use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Matches the previous Express API 1:1. Every response is wrapped by the
| ApiResponseEnvelope middleware as { ok: true, data } / { ok: false, error }.
|
*/

Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'data' => [
            'status' => 'up',
            'uptime' => round(microtime(true) - LARAVEL_START, 3),
        ],
    ]);
});

Route::get('/profile', [PortfolioController::class, 'profile']);
Route::get('/skills', [PortfolioController::class, 'skills']);
Route::get('/projects', [PortfolioController::class, 'projects']);
Route::get('/experience', [PortfolioController::class, 'experience']);

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact');

Route::get('/github/stats', [GitHubController::class, 'stats']);
