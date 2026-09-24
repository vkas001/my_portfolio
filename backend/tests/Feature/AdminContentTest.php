<?php

namespace Tests\Feature;

use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    /** Admin-only writes; authenticate every write in this file. */
    private array $headers = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminSeeder::class);
        $token = $this->postJson('/api/auth/login', [
            'email' => 'admin',
            'password' => 'password',
        ])->json('data.token');
        $this->headers = ['Authorization' => 'Bearer '.$token];
    }

    // ─── Guest isolation ─────────────────────────────────────────────────────

    public function test_guests_cannot_write_portfolio_content(): void
    {
        $this->putJson('/api/admin/profile', ['name' => 'X'])->assertStatus(401)->assertJsonPath('ok', false);
        $this->post('/api/admin/avatar', [])->assertStatus(401)->assertJsonPath('ok', false);
        $this->postJson('/api/admin/skills', ['id' => 'x1', 'name' => 'X', 'category' => 'tools', 'proficiency' => 50])
            ->assertStatus(401)->assertJsonPath('ok', false);
        $this->postJson('/api/admin/projects', ['title' => 'X'])->assertStatus(401)->assertJsonPath('ok', false);
        $this->deleteJson('/api/admin/experience/nope')->assertStatus(401)->assertJsonPath('ok', false);
    }

    // ─── Skills ──────────────────────────────────────────────────────────────

    public function test_skill_create_round_trips_and_reads_back(): void
    {
        $this->postJson('/api/admin/skills', [
            'id' => 'new-skill',
            'name' => 'Go',
            'category' => 'languages',
            'proficiency' => 88,
            'yearsUsed' => 3.5,
            'icon' => null,
        ], $this->headers)->assertOk()->assertJsonPath('ok', true)
            ->assertJsonPath('data.id', 'new-skill')
            ->assertJsonPath('data.name', 'Go')
            ->assertJsonPath('data.yearsUsed', 3.5);

        $this->getJson('/api/skills')->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonFragment(['id' => 'new-skill', 'name' => 'Go', 'proficiency' => 88]);

        $this->assertDatabaseHas('skills', ['id' => 'new-skill', 'name' => 'Go']);
    }

    public function test_skill_update_and_delete(): void
    {
        Skill::query()->create(['id' => 'upd', 'name' => 'Old', 'category' => 'tools', 'proficiency' => 10, 'years_used' => 0]);

        $this->putJson('/api/admin/skills/upd', [
            'name' => 'Vitest',
            'category' => 'tools',
            'proficiency' => 92,
            'yearsUsed' => 4,
        ], $this->headers)->assertOk()->assertJsonPath('data.name', 'Vitest');

        $this->deleteJson('/api/admin/skills/upd', [], $this->headers)->assertOk()
            ->assertJsonPath('data.id', 'upd');

        $this->assertDatabaseMissing('skills', ['id' => 'upd']);
    }

    public function test_skill_rejects_bad_category(): void
    {
        $this->postJson('/api/admin/skills', [
            'id' => 'bad',
            'name' => 'X',
            'category' => 'nope',
            'proficiency' => 50,
        ], $this->headers)->assertStatus(422)->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'category: The selected category is invalid.');
    }

    // ─── Projects ────────────────────────────────────────────────────────────

    public function test_project_create_reads_back_with_derived_order(): void
    {
        Project::query()->create([
            'id' => 'base', 'title' => 'Base', 'description' => 'd', 'tech_stack' => [],
            'category' => 'Web App', 'year' => 2026, 'order' => 2,
        ]);

        $this->postJson('/api/admin/projects', [
            'id' => 'special',
            'title' => 'Special Project',
            'description' => 'A fresh project',
            'longDescription' => 'Longer story.',
            'techStack' => ['React', 'Zustand'],
            'category' => 'Web App',
            'featured' => true,
            'liveUrl' => null,
            'githubUrl' => 'https://github.com/x',
            'imageUrl' => null,
            'year' => 2026,
        ], $this->headers)->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.title', 'Special Project')
            ->assertJsonPath('data.techStack', ['React', 'Zustand'])
            ->assertJsonPath('data.featured', true)
            ->assertJsonPath('data.order', 3);

        $this->getJson('/api/projects')->assertOk()
            ->assertJsonFragment(['id' => 'special', 'title' => 'Special Project']);
    }

    public function test_project_update_and_delete(): void
    {
        Project::query()->create([
            'id' => 'ed', 'title' => 'Before', 'description' => 'd', 'tech_stack' => '["A"]',
            'category' => 'Web App', 'year' => 2024, 'order' => 1,
        ]);

        $this->putJson('/api/admin/projects/ed', [
            'title' => 'After',
            'description' => 'edited',
            'techStack' => ['A', 'B'],
            'category' => 'Library',
            'featured' => false,
            'year' => 2025,
            'order' => 9,
        ], $this->headers)->assertOk()->assertJsonPath('data.title', 'After')
            ->assertJsonPath('data.category', 'Library')->assertJsonPath('data.order', 9);

        $this->deleteJson('/api/admin/projects/ed', [], $this->headers)->assertOk();
        $this->assertDatabaseMissing('projects', ['id' => 'ed']);
    }

    public function test_project_requires_title(): void
    {
        $this->postJson('/api/admin/projects', [
            'id' => 'typo', 'description' => 'd', 'category' => 'Web App', 'year' => 2026,
        ], $this->headers)->assertStatus(422)->assertJsonPath('ok', false);
    }

    // ─── Experience ──────────────────────────────────────────────────────────

    public function test_experience_round_trip(): void
    {
        $this->postJson('/api/admin/experience', [
            'id' => 'exp-new',
            'company' => 'Acme',
            'role' => 'Engineer',
            'startDate' => '2020-01-15',
            'endDate' => null,
            'location' => 'Remote',
            'employmentType' => 'Full-time',
            'highlights' => ['Shipped things'],
            'techStack' => ['PHP', 'Laravel'],
        ], $this->headers)->assertOk()
            ->assertJsonPath('data.id', 'exp-new')
            ->assertJsonPath('data.endDate', null)
            ->assertJsonPath('data.highlights', ['Shipped things']);

        $this->getJson('/api/experience')->assertOk()
            ->assertJsonFragment(['id' => 'exp-new', 'company' => 'Acme']);

        $this->putJson('/api/admin/experience/exp-new', [
            'company' => 'Acme v2',
            'role' => 'Staff',
            'startDate' => '2020-01-15',
            'endDate' => '2024-02-01',
            'location' => 'Remote',
            'employmentType' => 'Contract',
            'highlights' => ['Ships more'],
            'techStack' => ['Laravel'],
        ], $this->headers)->assertOk()->assertJsonPath('data.company', 'Acme v2')
            ->assertJsonPath('data.endDate', '2024-02-01');

        $this->deleteJson('/api/admin/experience/exp-new', [], $this->headers)->assertOk();
        $this->assertDatabaseMissing('experience', ['id' => 'exp-new']);
    }

    public function test_experience_rejects_end_before_start(): void
    {
        $this->postJson('/api/admin/experience', [
            'id' => 'oops',
            'company' => 'X',
            'role' => 'R',
            'startDate' => '2024-01-01',
            'endDate' => '2023-01-01',
            'location' => 'L',
            'employmentType' => 'F',
        ], $this->headers)->assertStatus(422)->assertJsonPath('ok', false);
    }

    // ─── Profile ─────────────────────────────────────────────────────────────

    public function test_profile_upsert_and_socials_replace(): void
    {
        $this->putJson('/api/admin/profile', [
            'name' => 'Vikas',
            'title' => 'Platform Engineer',
            'shortBio' => 'Short.',
            'bio' => 'Longer bio.',
            'avatarUrl' => null,
            'resumeUrl' => null,
            'email' => 'me@example.com',
            'location' => 'Kathmandu',
            'yearsExperience' => 6,
            'socials' => [
                ['id' => 'g1', 'label' => 'GitHub', 'url' => 'https://github.com/vikas', 'icon' => 'github'],
            ],
        ], $this->headers)->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.name', 'Vikas')
            ->assertJsonPath('data.yearsExperience', 6)
            ->assertJsonPath('data.socials.0.url', 'https://github.com/vikas');

        // Second save replaces the list, old links gone.
        $this->putJson('/api/admin/profile', [
            'name' => 'Vikas',
            'title' => 'Platform Engineer',
            'email' => 'me@example.com',
            'location' => 'Kathmandu',
            'yearsExperience' => 6,
            'socials' => [
                ['label' => 'LinkedIn', 'url' => 'https://linkedin.com/in/vikas', 'icon' => 'linkedin'],
            ],
        ], $this->headers)->assertOk()->assertJsonCount(1, 'data.socials')
            ->assertJsonPath('data.socials.0.label', 'LinkedIn');

        $this->assertDatabaseMissing('social_links', ['id' => 'g1']);
        $this->getJson('/api/profile')->assertOk()
            ->assertJsonPath('data.name', 'Vikas')
            ->assertJsonPath('data.socials.0.label', 'LinkedIn');
    }

    public function test_profile_validation_rejects_invalid_social_icon(): void
    {
        $this->putJson('/api/admin/profile', [
            'name' => 'V',
            'title' => 'T',
            'email' => 'a@b.c',
            'location' => 'L',
            'yearsExperience' => 1,
            'socials' => [
                ['label' => 'X', 'url' => 'https://x.com', 'icon' => 'myspace'],
            ],
        ], $this->headers)->assertStatus(422)->assertJsonPath('ok', false);
    }

    public function test_admin_can_upload_avatar_and_replaces_previous(): void
    {
        Storage::fake('public');
        Profile::query()->create([
            'id' => 'me',
            'name' => 'Vikas',
            'title' => 'Engineer',
            'email' => 'me@example.com',
            'location' => 'Kathmandu',
        ]);

        $this->post('/api/admin/avatar', [
            'image' => UploadedFile::fake()->image('first.png', 200, 200),
        ], $this->headers)->assertOk()->assertJsonPath('ok', true);

        $first = Profile::query()->where('id', 'me')->first()->avatar_url;
        $this->assertStringContainsString('/storage/avatars/', $first);
        $firstName = substr($first, strpos($first, '/storage/') + strlen('/storage/'));
        Storage::disk('public')->assertExists($firstName);

        // A second upload replaces the file and URL, and the old file is removed.
        $this->post('/api/admin/avatar', [
            'image' => UploadedFile::fake()->image('second.png', 200, 200),
        ], $this->headers)->assertOk()->assertJsonPath('ok', true);

        $second = Profile::query()->where('id', 'me')->first()->avatar_url;
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($firstName);

        $this->getJson('/api/profile')->assertOk()
            ->assertJsonPath('data.avatarUrl', Profile::query()->where('id', 'me')->first()->avatar_url);
    }

    public function test_admin_avatar_upload_rejects_non_image(): void
    {
        Storage::fake('public');

        $this->post('/api/admin/avatar', [
            'image' => UploadedFile::fake()->create('evil.php', 10),
        ], $this->headers)->assertStatus(422)->assertJsonPath('ok', false);

        Storage::disk('public')->assertDirectoryEmpty('avatars');
    }
}
