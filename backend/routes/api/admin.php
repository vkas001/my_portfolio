<?php

use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\SkillController;
use App\Services\AccessControl\PermissionRegistry;
use Illuminate\Support\Facades\Route;

// Admin portfolio content CRUD — auth:api + permission gates (permission
// asserts the single admin's is_admin flag). Guests/no-token → 403.
Route::middleware(['auth:api', 'permission:'.PermissionRegistry::PROFILE_MANAGE])->group(function () {
    Route::put('/admin/profile', [ProfileController::class, 'update']);
    Route::post('/admin/avatar', [ProfileController::class, 'uploadAvatar']);
});

Route::middleware(['auth:api', 'permission:'.PermissionRegistry::SKILL_MANAGE])->group(function () {
    Route::post('/admin/skills', [SkillController::class, 'store']);
    Route::put('/admin/skills/{skill}', [SkillController::class, 'update']);
    Route::delete('/admin/skills/{skill}', [SkillController::class, 'destroy']);
});

Route::middleware(['auth:api', 'permission:'.PermissionRegistry::PROJECT_MANAGE])->group(function () {
    Route::post('/admin/projects', [ProjectController::class, 'store']);
    Route::put('/admin/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/admin/projects/{project}', [ProjectController::class, 'destroy']);
});

Route::middleware(['auth:api', 'permission:'.PermissionRegistry::EXPERIENCE_MANAGE])->group(function () {
    Route::post('/admin/experience', [ExperienceController::class, 'store']);
    Route::put('/admin/experience/{experience}', [ExperienceController::class, 'update']);
    Route::delete('/admin/experience/{experience}', [ExperienceController::class, 'destroy']);
});
