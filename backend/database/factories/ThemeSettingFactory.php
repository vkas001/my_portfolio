<?php

namespace Database\Factories;

use App\Models\ThemeSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThemeSetting>
 */
class ThemeSettingFactory extends Factory
{
    protected $model = ThemeSetting::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 1,
            'settings' => [
                'mode' => 'dark',
                'accent' => 'violet',
                'wallpaper' => 'aurora',
                'font' => 'Inter',
                'startupWindows' => [],
            ],
        ];
    }
}
