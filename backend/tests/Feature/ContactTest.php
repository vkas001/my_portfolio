<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_submission_wraps_single_envelope(): void
    {
        $this->postJson('/api/contact', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'subject' => 'Hello there',
            'message' => 'A message long enough to pass validation.',
        ])->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.message', "Message received — I'll get back to you soon!")
            ->assertJsonMissingPath('data.ok');

        $this->assertDatabaseHas('contact_messages', ['email' => 'jane@example.com', 'subject' => 'Hello there']);
    }

    public function test_contact_rejects_short_message(): void
    {
        $this->postJson('/api/contact', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'subject' => 'Hi',
            'message' => 'too short',
        ])->assertStatus(422)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'message: The message field must be at least 10 characters.');
    }

    public function test_contact_rejects_filled_honeypot(): void
    {
        $this->postJson('/api/contact', [
            'name' => 'Bot',
            'email' => 'bot@example.com',
            'subject' => 'Spam',
            'message' => 'This is a long enough spam message.',
            'honeypot' => 'filled',
        ])->assertStatus(422)
            ->assertJsonPath('error', 'honeypot: Spam detected.');

        $this->assertDatabaseCount('contact_messages', 0);
    }
}
