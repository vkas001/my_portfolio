<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'up',
        'uptime' => round(microtime(true) - LARAVEL_START, 3),
    ]);
});
