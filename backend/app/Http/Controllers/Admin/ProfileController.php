<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UploadAvatarRequest;
use App\Services\Profile\ProfileService;
use Illuminate\Http\JsonResponse;

/**
 * Admin-only profile writes (behind auth:api + permission:profile:manage).
 * Returns plain payloads; ApiResponseEnvelope wraps them.
 */
class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profile) {}

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        return response()->json($this->profile->update($request->validated()));
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        return response()->json($this->profile->uploadAvatar($request->file('image')));
    }
}
