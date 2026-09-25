<?php

use App\Http\Controllers\ThemeController;
use App\Services\AccessControl\PermissionRegistry;
use Illuminate\Support\Facades\Route;

Route::get('/theme', [ThemeController::class, 'show']);

// Theme writes persist the admin's live site — admins only. Guests keep a
// local-only theme in the browser that never reaches these endpoints.
Route::middleware(['auth:api', 'permission:'.PermissionRegistry::THEME_MANAGE])->group(function () {
    Route::put('/theme', [ThemeController::class, 'update']);
    Route::delete('/theme/reset', [ThemeController::class, 'reset']);
});
