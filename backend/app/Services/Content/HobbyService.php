<?php

namespace App\Services\Content;

use App\Models\Hobby;

class HobbyService
{
    public function store(array $data): Hobby
    {
        return Hobby::query()->create([
            'id' => $data['id'],
            'name' => $data['name'],
            'icon' => $data['icon'],
            'description' => $data['description'] ?? null,
            'order' => $data['order'] ?? Hobby::query()->max('order') + 1,
        ])->refresh();
    }

    public function update(string $id, array $data): Hobby
    {
        $hobby = Hobby::query()->findOrFail($id);

        $hobby->fill([
            'name' => $data['name'],
            'icon' => $data['icon'],
            'description' => $data['description'] ?? null,
            'order' => $data['order'] ?? $hobby->order,
        ])->save();

        return $hobby->refresh();
    }

    public function destroy(string $id): void
    {
        Hobby::query()->findOrFail($id)->delete();
    }
}
