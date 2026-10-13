<?php

namespace App\Services\Content;

use App\Models\Blog;

class BlogService
{
    public function store(array $data): Blog
    {
        return Blog::query()->create([
            'id' => $data['id'],
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'tags' => $data['tags'] ?? [],
            'cover_url' => $data['coverUrl'] ?? null,
            'published' => $data['published'] ?? true,
            'published_at' => $data['publishedAt'] ?? null,
            'order' => $data['order'] ?? Blog::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Blog
    {
        $blog = Blog::query()->findOrFail($id);

        $blog->fill([
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'tags' => $data['tags'] ?? [],
            'cover_url' => $data['coverUrl'] ?? null,
            'published' => $data['published'] ?? $blog->published,
            'published_at' => $data['publishedAt'] ?? $blog->published_at,
            'order' => $data['order'] ?? $blog->order,
        ])->save();

        return $blog->refresh();
    }

    public function destroy(string $id): void
    {
        Blog::query()->findOrFail($id)->delete();
    }
}
