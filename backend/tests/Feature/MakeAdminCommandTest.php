<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MakeAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_a_new_admin_with_a_hashed_password(): void
    {
        $this->artisan('make:admin', [
            '--name' => 'Boss',
            '--email' => 'boss@example.com',
            '--password' => 'super-secret',
        ])->assertExitCode(0);

        $user = User::query()->where('email', 'boss@example.com')->firstOrFail();

        $this->assertSame('Boss', $user->name);
        $this->assertTrue((bool) $user->is_admin);
        $this->assertNotSame('super-secret', $user->password);
        $this->assertTrue(Hash::check('super-secret', $user->password));
    }

    public function test_defaults_the_display_name_to_admin(): void
    {
        $this->artisan('make:admin', [
            '--email' => 'admin2',
            '--password' => 'super-secret',
        ])->assertExitCode(0);

        $user = User::query()->where('email', 'admin2')->firstOrFail();

        $this->assertSame('Admin', $user->name);
        $this->assertTrue((bool) $user->is_admin);
    }

    public function test_promotes_an_existing_user_without_creating_a_duplicate(): void
    {
        $user = User::factory()->create(['email' => 'later-admin@example.com']);
        $this->assertFalse((bool) $user->is_admin);

        $this->artisan('make:admin', [
            '--email' => 'later-admin@example.com',
            '--password' => 'brand-new-pass',
        ])->assertExitCode(0);

        $user->refresh();

        $this->assertTrue((bool) $user->is_admin);
        $this->assertTrue(Hash::check('brand-new-pass', $user->password));
        $this->assertSame(1, User::query()->where('email', 'later-admin@example.com')->count());
    }

    public function test_rejects_a_password_shorter_than_eight_characters(): void
    {
        $this->artisan('make:admin', [
            '--email' => 'weak@example.com',
            '--password' => 'short',
        ])->assertExitCode(1);

        $this->assertNull(User::query()->where('email', 'weak@example.com')->first());
    }

    public function test_non_interactive_runs_require_email_and_password(): void
    {
        $this->artisan('make:admin', ['--no-interaction' => true])
            ->assertExitCode(1);

        $this->assertSame(0, User::query()->count());
    }

    public function test_seeder_never_ships_default_credentials_to_production(): void
    {
        $this->app['env'] = 'production';

        $this->artisan('db:seed', [
            '--class' => AdminSeeder::class,
            '--force' => true,
        ])->assertExitCode(0);

        $this->assertSame(0, User::query()->count());
    }
}
