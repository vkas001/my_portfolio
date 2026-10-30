<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

/**
 * Provision the single portfolio admin without shipping default credentials.
 * Creates the account when it does not exist, otherwise promotes it and
 * updates the password — always through forceFill because `is_admin` is
 * deliberately not mass-assignable on the User model.
 */
#[Signature('make:admin
    {--name= : Display name (defaults to "Admin" for a new account)}
    {--email= : Login identifier / email (prompted when omitted)}
    {--password= : Password, min 8 chars (prompted securely when omitted)}')]
#[Description('Create or promote the single portfolio admin user')]
class MakeAdminCommand extends Command
{
    public function handle(): int
    {
        $email = $this->option('email');
        $password = $this->option('password');

        // No TTY to prompt on (CI / provisioning scripts): fail loudly instead
        // of blocking on a question that can never be answered.
        if (! $this->input->isInteractive() && ($email === null || $password === null)) {
            $this->error('Non-interactive mode requires --email and --password.');

            return self::FAILURE;
        }

        if ($email === null || trim((string) $email) === '') {
            $email = $this->ask('Email / login identifier for the admin');
        }

        if ($password === null || $password === '') {
            $password = $this->secret('Password (min 8 characters)');
        }

        $email = trim((string) $email);

        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            [
                'email' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string', 'min:8', 'max:255'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();
        $name = $this->option('name');

        if ($user === null) {
            (new User)->forceFill([
                'name' => $name ?: 'Admin',
                'email' => $email,
                'password' => $password,
                'is_admin' => true,
            ])->save();

            $this->info("Admin created: {$email}");

            return self::SUCCESS;
        }

        $user->forceFill([
            'password' => $password,
            'is_admin' => true,
        ]);

        if ($name) {
            $user->name = $name;
        }

        $user->save();

        $this->info("Admin updated: {$email}");

        return self::SUCCESS;
    }
}
