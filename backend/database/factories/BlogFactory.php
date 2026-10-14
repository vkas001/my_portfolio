<?php

namespace Database\Factories;

use App\Models\Blog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Blog>
 */
class BlogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(3),
            'title' => fake()->sentence(4),
            'excerpt' => fake()->sentence(10),
            'body' => fake()->paragraphs(3, true),
            'tags' => fake()->words(3),
            'cover_url' => null,
            'published' => true,
            'published_at' => fake()->dateTimeThisYear(),
        ];
    }
}
