<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateThemeRequest;
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
}
