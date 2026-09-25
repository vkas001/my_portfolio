<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    protected $model = Skill::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(3),
            'name' => fake()->unique()->words(2, true),
            'category' => fake()->randomElement([
                'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
            ]),
            'proficiency' => fake()->numberBetween(40, 100),
            'years_used' => fake()->randomFloat(1, 0, 15),
            'icon' => fake()->randomElement(['code', 'server', 'database', 'figma', 'terminal']),
        ];
    }
}
