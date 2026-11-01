<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the single admin account (idempotent — safe to re-run).
     * Local/testing only: creates the demo admin / password account. In
     * production it only promotes an existing account; a missing admin must
     * be provisioned explicitly with `php artisan make:admin`.
     */
    public function run(): void
    {
        $user = User::query()->firstWhere('username', 'admin');

        if ($user === null) {
            // Never ship the well-known demo credentials to production —
            // provision the real admin explicitly with `php artisan make:admin`.
            if (app()->environment('production')) {
                $this->command?->warn(
                    'No admin user exists. Run `php artisan make:admin` to create one.'
                );

                return;
            }

            // forceFill: `is_admin` is not fillable on purpose (see User).
            User::query()->forceCreate([
                'name' => 'Admin',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]);

            return;
        }

        $user->forceFill(['name' => 'Admin', 'is_admin' => true])->save();
    }
}
