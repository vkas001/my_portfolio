<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHobbyRequest;
use App\Http\Requests\UpdateHobbyRequest;
use App\Services\Content\HobbyService;
use Illuminate\Http\JsonResponse;

class HobbyController extends Controller
{
    public function __construct(private readonly HobbyService $hobbies) {}

    public function store(StoreHobbyRequest $request): JsonResponse
    {
        return response()->json($this->hobbies->store($request->validated()));
    }

    public function update(UpdateHobbyRequest $request, string $id): JsonResponse
    {
        return response()->json($this->hobbies->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->hobbies->destroy($id);

        return response()->json(['id' => $id]);
    }
}
