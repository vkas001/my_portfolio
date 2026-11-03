<?php

namespace App\Services\Content;

use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProjectService
{
    public function store(array $data): Project
    {
        return Project::query()->create([
            'id' => $data['id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'long_description' => $data['longDescription'] ?? null,
            'tech_stack' => $data['techStack'] ?? [],
            'category' => $data['category'],
            'featured' => $data['featured'] ?? false,
            'is_client' => $data['isClient'] ?? false,
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'screenshots' => $data['screenshots'] ?? [],
            'year' => $data['year'],
            'order' => $data['order'] ?? Project::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Project
    {
        $project = Project::query()->findOrFail($id);

        // Removed proofs leave their uploads orphaned — clear the ones that
        // dropped out (external URLs are never touched).
        if (array_key_exists('screenshots', $data)) {
            foreach (array_diff($project->screenshots, $data['screenshots'] ?? []) as $removed) {
                $this->deleteCustomFile($removed);
            }
        }

        $project->fill([
            'title' => $data['title'],
            'description' => $data['description'],
            'long_description' => $data['longDescription'] ?? null,
            'tech_stack' => $data['techStack'] ?? [],
            'category' => $data['category'],
            'featured' => $data['featured'] ?? false,
            'is_client' => $data['isClient'] ?? false,
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'screenshots' => $data['screenshots'] ?? [],
            'year' => $data['year'],
            'order' => $data['order'] ?? $project->order,
        ])->save();

        return $project->refresh();
    }

    public function destroy(string $id): void
    {
        $project = Project::query()->findOrFail($id);
        foreach ($project->screenshots as $url) {
            $this->deleteCustomFile($url);
        }
        $project->delete();
    }

    /**
     * Store a proof screenshot under projects/screenshots/ and return its
     * public URL. Editor-session uploads that never get saved stay orphaned
     * (same trade-off as blog covers) — saves, removals and deletes clean up.
     */
    public function uploadScreenshot(UploadedFile $image): string
    {
        return '/storage/'.$image->store('projects/screenshots', 'public');
    }

    /** Delete a stored screenshot upload; external URLs are never touched. */
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
        if (str_starts_with($rel, 'projects/screenshots/')) {
            Storage::disk('public')->delete($rel);
        }
    }
}
