<?php

namespace App\Services\Content;

use App\Models\Education;

class EducationService
{
    public function store(array $data): Education
    {
        return Education::query()->create([
            'id' => $data['id'],
            'institution' => $data['institution'],
            'degree' => $data['degree'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'description' => $data['description'] ?? null,
            'order' => $data['order'] ?? Education::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Education
    {
        $education = Education::query()->findOrFail($id);

        $education->fill([
            'institution' => $data['institution'],
            'degree' => $data['degree'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'description' => $data['description'] ?? null,
            'order' => $data['order'] ?? $education->order,
        ])->save();

        return $education->refresh();
    }

    public function destroy(string $id): void
    {
        Education::query()->findOrFail($id)->delete();
    }
}
