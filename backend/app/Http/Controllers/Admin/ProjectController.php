<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Services\Content\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projects) {}

    public function store(StoreProjectRequest $request): JsonResponse
    {
        return response()->json($this->projects->store($request->validated()));
    }

    public function update(UpdateProjectRequest $request, string $id): JsonResponse
    {
        return response()->json($this->projects->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->projects->destroy($id);

        return response()->json(['id' => $id]);
    }
}
