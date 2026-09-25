<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(3),
            'title' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(12),
            'long_description' => fake()->paragraphs(3, true),
            'tech_stack' => fake()->randomElements(['Laravel', 'React', 'TypeScript', 'Tailwind', 'MySQL', 'Redis'], 3),
            'category' => fake()->randomElement(['Web App', 'CLI', 'Open Source', 'Dashboard', 'Design System']),
            'featured' => fake()->boolean(35),
            'live_url' => fake()->url(),
            'github_url' => fake()->url(),
            'image_url' => null,
            'year' => fake()->numberBetween(2019, 2026),
            'order' => fake()->unique()->numberBetween(0, 50),
        ];
    }
}
