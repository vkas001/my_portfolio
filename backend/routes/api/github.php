<?php

use App\Http\Controllers\GitHubController;
use Illuminate\Support\Facades\Route;

Route::get('/github/stats', [GitHubController::class, 'stats']);
