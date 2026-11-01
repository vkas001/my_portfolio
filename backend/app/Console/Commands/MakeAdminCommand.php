<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Provision the single portfolio admin without shipping default credentials.
 * Creates the account when it does not exist, otherwise promotes it and
 * updates the password — always through forceFill because `is_admin` is
 * deliberately not mass-assignable on the User model.
 */
#[Signature('make:admin
    {--name= : Display name (defaults to "Admin" for a new account)}
    {--username= : Login identifier / username (prompted when omitted)}
    {--password= : Password, min 8 chars (prompted securely when omitted)}')]
#[Description('Create or promote the single portfolio admin user')]
class MakeAdminCommand extends Command
{
    public function handle(): int
    {
        $username = $this->option('username');
        $password = $this->option('password');

        // No TTY to prompt on (CI / provisioning scripts): fail loudly instead
        // of blocking on a question that can never be answered.
        if (! $this->input->isInteractive() && ($username === null || $password === null)) {
            $this->error('Non-interactive mode requires --username and --password.');

            return self::FAILURE;
        }

        if ($username === null || trim((string) $username) === '') {
            $username = $this->ask('Username / login identifier for the admin');
        }

        if ($password === null || $password === '') {
            $password = $this->secret('Password (min 8 characters)');
        }

        $username = trim((string) $username);

        $validator = Validator::make(
            ['username' => $username, 'password' => $password],
            [
                'username' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string', 'min:8', 'max:255'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user = User::query()->where('username', $username)->first();
        $name = $this->option('name');

        if ($user === null) {
            (new User)->forceFill([
                'name' => $name ?: 'Admin',
                'username' => $username,
                'password' => Hash::make($password),
                'is_admin' => true,
            ])->save();

            $this->info("Admin created: {$username}");

            return self::SUCCESS;
        }

        $user->forceFill([
            'password' => Hash::make($password),
            'is_admin' => true,
        ]);

        if ($name) {
            $user->name = $name;
        }

        $user->save();

        $this->info("Admin updated: {$username}");

        return self::SUCCESS;
    }
}
