<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Services\Content\ExperienceService;
use Illuminate\Http\JsonResponse;

class ExperienceController extends Controller
{
    public function __construct(private readonly ExperienceService $experience) {}

    public function store(StoreExperienceRequest $request): JsonResponse
    {
        return response()->json($this->experience->store($request->validated()));
    }

    public function update(UpdateExperienceRequest $request, string $id): JsonResponse
    {
        return response()->json($this->experience->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->experience->destroy($id);

        return response()->json(['id' => $id]);
    }
}
