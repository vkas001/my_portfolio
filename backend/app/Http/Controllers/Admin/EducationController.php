<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEducationRequest;
use App\Http\Requests\UpdateEducationRequest;
use App\Services\Content\EducationService;
use Illuminate\Http\JsonResponse;

class EducationController extends Controller
{
    public function __construct(private readonly EducationService $education) {}

    public function store(StoreEducationRequest $request): JsonResponse
    {
        return response()->json($this->education->store($request->validated()));
    }

    public function update(UpdateEducationRequest $request, string $id): JsonResponse
    {
        return response()->json($this->education->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->education->destroy($id);

        return response()->json(['id' => $id]);
    }
}
