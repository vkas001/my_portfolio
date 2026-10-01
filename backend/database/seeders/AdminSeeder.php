<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed the single admin account (idempotent — safe to re-run).
     * Default credentials: admin / password. The password is only set when
     * the account is created, so re-seeding never resets a changed password.
     */
    public function run(): void
    {
        $user = User::query()->firstWhere('email', 'admin');

        if ($user === null) {
            // forceFill: `is_admin` is not fillable on purpose (see User).
            User::query()->forceCreate([
                'name' => 'Admin',
                'email' => 'admin',
                'password' => 'password',
                'is_admin' => true,
            ]);

            return;
        }

        $user->forceFill(['name' => 'Admin', 'is_admin' => true])->save();
    }
}
