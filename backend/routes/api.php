<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GitHubController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ThemeController;
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

Route::get('/theme', [ThemeController::class, 'show']);

// Theme writes persist the admin's live site — admins only. Guests keep a
// local-only theme in the browser that never reaches these endpoints.
Route::middleware('auth.token')->group(function () {
    Route::put('/theme', [ThemeController::class, 'update']);
    Route::delete('/theme/reset', [ThemeController::class, 'reset']);
});

// Admin portfolio content CRUD — the theme guard above is the same one these
// hang off: only a signed-in admin can write the live site.
Route::middleware('auth.token')->group(function () {
    Route::put('/admin/profile', [AdminController::class, 'updateProfile']);
    Route::post('/admin/avatar', [AdminController::class, 'uploadAvatar']);

    Route::post('/admin/skills', [AdminController::class, 'storeSkill']);
    Route::put('/admin/skills/{skill}', [AdminController::class, 'updateSkill']);
    Route::delete('/admin/skills/{skill}', [AdminController::class, 'destroySkill']);

    Route::post('/admin/projects', [AdminController::class, 'storeProject']);
    Route::put('/admin/projects/{project}', [AdminController::class, 'updateProject']);
    Route::delete('/admin/projects/{project}', [AdminController::class, 'destroyProject']);

    Route::post('/admin/experience', [AdminController::class, 'storeExperience']);
    Route::put('/admin/experience/{experience}', [AdminController::class, 'updateExperience']);
    Route::delete('/admin/experience/{experience}', [AdminController::class, 'destroyExperience']);
});

// Single-admin auth: hand-rolled bearer tokens (no Sanctum — see conventions).
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::middleware('auth.token')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
