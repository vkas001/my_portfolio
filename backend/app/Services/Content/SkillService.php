<?php

namespace App\Services\Content;

use App\Models\Skill;

class SkillService
{
    public function store(array $data): Skill
    {
        return Skill::query()->create([
            'id' => $data['id'],
            'name' => $data['name'],
            'category' => $data['category'],
            'proficiency' => $data['proficiency'],
            'years_used' => $data['yearsUsed'] ?? 0,
            'icon' => $data['icon'] ?? null,
        ])->refresh();
    }

    public function update(string $id, array $data): Skill
    {
        $skill = Skill::query()->findOrFail($id);

        $skill->fill([
            'name' => $data['name'],
            'category' => $data['category'],
            'proficiency' => $data['proficiency'],
            'years_used' => $data['yearsUsed'] ?? 0,
            'icon' => $data['icon'] ?? null,
        ])->save();

        return $skill->refresh();
    }

    public function destroy(string $id): void
    {
        Skill::query()->findOrFail($id)->delete();
    }
}
