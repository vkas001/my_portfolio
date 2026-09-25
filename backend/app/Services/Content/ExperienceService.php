<?php

namespace App\Services\Content;

use App\Models\Experience;

class ExperienceService
{
    public function store(array $data): Experience
    {
        return Experience::query()->create([
            'id' => $data['id'],
            'company' => $data['company'],
            'role' => $data['role'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'location' => $data['location'],
            'employment_type' => $data['employmentType'],
            'highlights' => $data['highlights'] ?? [],
            'tech_stack' => $data['techStack'] ?? [],
            'order' => $data['order'] ?? Experience::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Experience
    {
        $experience = Experience::query()->findOrFail($id);

        $experience->fill([
            'company' => $data['company'],
            'role' => $data['role'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'location' => $data['location'],
            'employment_type' => $data['employmentType'],
            'highlights' => $data['highlights'] ?? [],
            'tech_stack' => $data['techStack'] ?? [],
            'order' => $data['order'] ?? $experience->order,
        ])->save();

        return $experience->refresh();
    }

    public function destroy(string $id): void
    {
        Experience::query()->findOrFail($id)->delete();
    }
}
