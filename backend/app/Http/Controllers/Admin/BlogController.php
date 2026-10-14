<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use App\Services\Content\BlogService;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    public function __construct(private readonly BlogService $blogs) {}

    public function store(StoreBlogRequest $request): JsonResponse
    {
        return response()->json($this->blogs->store($request->validated()));
    }

    public function update(UpdateBlogRequest $request, string $id): JsonResponse
    {
        return response()->json($this->blogs->update($id, $request->validated()));
    }

    public function destroy(string $id): JsonResponse
    {
        $this->blogs->destroy($id);

        return response()->json(['id' => $id]);
    }

    /** Full list including drafts (editor); the public feed stays published-only. */
    public function index(): JsonResponse
    {
        return response()->json(
            Blog::query()->orderBy('order')->get()
        );
    }
}
