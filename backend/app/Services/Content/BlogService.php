<?php

namespace App\Services\Content;

use App\Models\Blog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

        // Cover swaps leave the previous upload orphaned — clear ours when
        // the URL changed (external URLs are never touched).
        if (array_key_exists('coverUrl', $data) && $data['coverUrl'] !== $blog->cover_url) {
            $this->deleteCustomFile($blog->cover_url);
        }

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
        $blog = Blog::query()->findOrFail($id);
        $this->deleteCustomFile($blog->cover_url);
        $blog->delete();
    }

    /**
     * Store a cover upload under blog-covers/ and return its public URL.
     * Editor-session re-uploads that never get saved stay orphaned (same
     * trade-off as avatars pre-save) — saves, swaps and deletes clean up.
     */
    public function uploadCover(UploadedFile $image): string
    {
        return '/storage/'.$image->store('blog-covers', 'public');
    }

    /** Delete a stored cover upload; external URLs are never touched. */
    private function deleteCustomFile(?string $url): void
    {
        if (! is_string($url)) {
            return;
        }
        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return;
        }
        $rel = substr($url, $pos + strlen($marker));
        if (str_starts_with($rel, 'blog-covers/')) {
            Storage::disk('public')->delete($rel);
        }
    }
}
