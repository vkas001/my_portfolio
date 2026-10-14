<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateThemeRequest;
use App\Http\Requests\UploadSplashImageRequest;
use App\Http\Requests\UploadWallpaperImageRequest;
use App\Services\Theme\ThemeService;
use Illuminate\Http\JsonResponse;

/**
 * Single-user theme persistence. Reads are public; writes sit behind
 * auth:api + permission:theme:manage. Plain payloads → envelope middleware.
 */
class ThemeController extends Controller
{
    public function __construct(private readonly ThemeService $theme) {}

    public function show(): JsonResponse
    {
        return response()->json($this->theme->current());
    }

    public function update(UpdateThemeRequest $request): JsonResponse
    {
        return response()->json($this->theme->apply($request->validated()));
    }

    public function reset(): JsonResponse
    {
        return response()->json($this->theme->reset());
    }

    public function uploadSplashImage(UploadSplashImageRequest $request): JsonResponse
    {
        return response()->json($this->theme->uploadSplashImage($request->file('image')));
    }

    public function removeSplashImage(): JsonResponse
    {
        return response()->json($this->theme->removeSplashImage());
    }

    public function uploadWallpaperImage(UploadWallpaperImageRequest $request): JsonResponse
    {
        return response()->json($this->theme->uploadWallpaperImage($request->file('image')));
    }

    public function removeWallpaperImage(): JsonResponse
    {
        return response()->json($this->theme->removeWallpaperImage());
    }
}
