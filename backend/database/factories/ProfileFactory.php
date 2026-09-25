<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'me',
            'name' => fake()->name(),
            'title' => fake()->jobTitle(),
            'short_bio' => fake()->sentence(14),
            'bio' => fake()->paragraphs(3, true),
            'personal_note' => fake()->paragraph(),
            'strengths' => ['Adaptable', 'Focused'],
            'open_to_work' => 'Open to new roles',
            'strengths_title' => 'What I bring',
            'strengths_icon' => 'zap',
            'personal_note_title' => 'Off the clock',
            'personal_note_icon' => 'coffee',
            'resume_url' => null,
            'email' => fake()->safeEmail(),
            'location' => fake()->city(),
            'years_experience' => fake()->numberBetween(3, 15),
        ];
    }
}
