<?php

namespace App\Services\Content;

use App\Models\Project;

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
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'year' => $data['year'],
            'order' => $data['order'] ?? Project::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Project
    {
        $project = Project::query()->findOrFail($id);

        $project->fill([
            'title' => $data['title'],
            'description' => $data['description'],
            'long_description' => $data['longDescription'] ?? null,
            'tech_stack' => $data['techStack'] ?? [],
            'category' => $data['category'],
            'featured' => $data['featured'] ?? false,
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'year' => $data['year'],
            'order' => $data['order'] ?? $project->order,
        ])->save();

        return $project->refresh();
    }

    public function destroy(string $id): void
    {
        Project::query()->findOrFail($id)->delete();
    }
}
