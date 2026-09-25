<?php

namespace Database\Factories;

use App\Models\Experience;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Experience>
 */
class ExperienceFactory extends Factory
{
    protected $model = Experience::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-8 years', '-1 year');

        return [
            'id' => 'exp_'.fake()->unique()->numberBetween(1000, 9999),
            'company' => fake()->company(),
            'role' => fake()->jobTitle(),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => fake()->boolean(70) ? fake()->dateTimeInInterval($start, '+5 years')->format('Y-m-d') : null,
            'location' => fake()->city(),
            'employment_type' => fake()->randomElement(['Full-time', 'Contract', 'Freelance', 'Internship']),
            'highlights' => fake()->sentences(3),
            'tech_stack' => fake()->randomElements(['Laravel', 'React', 'Python', 'AWS', 'Docker'], 3),
            'order' => fake()->unique()->numberBetween(0, 50),
        ];
    }
}
