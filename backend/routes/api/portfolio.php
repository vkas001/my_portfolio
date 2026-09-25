<?php

use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

// Public reads — no auth.
Route::get('/profile', [PortfolioController::class, 'profile']);
Route::get('/skills', [PortfolioController::class, 'skills']);
Route::get('/projects', [PortfolioController::class, 'projects']);
Route::get('/experience', [PortfolioController::class, 'experience']);
Route::get('/education', [PortfolioController::class, 'education']);
Route::get('/hobbies', [PortfolioController::class, 'hobbies']);
