<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Services\Content\SkillService;
use Illuminate\Http\JsonResponse;

class SkillController extends Controller
{
    public function __construct(private readonly SkillService $skills) {}

    public function store(StoreSkillRequest $request): JsonResponse
    {
        return response()->json($this->skills->store($request->validated()));
    }

    public function update(UpdateSkillRequest $request, string $id): JsonResponse
    {
        return response()->json($this->skills->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->skills->destroy($id);

        return response()->json(['id' => $id]);
    }
}
