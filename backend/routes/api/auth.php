<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Single-admin auth: hand-rolled bearer tokens (no Sanctum — see conventions).
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
