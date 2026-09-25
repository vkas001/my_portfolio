<?php

namespace App\Services\Auth;

use App\Models\AuthToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Token lifecycle for the single admin (ibiz_v2 SessionService pattern,
 * collapsed to one identity): issue/revoke bearer tokens and build the
 * user payload the frontend's LoginResponse/AuthUser types expect.
 */
class AuthService
{
    /**
     * Validate credentials, returning `{ token, user }` on success or null.
     * Constant-time failure: same result whether the email or the password
     * is wrong so accounts can't be enumerated.
     */
    public function attempt(string $identifier, string $password): ?array
    {
        $user = User::query()->where('email', $identifier)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            return null;
        }

        return [
            'token' => $this->issueToken($user),
            'user' => $this->userPayload($user),
        ];
    }

    public function issueToken(User $user): string
    {
        $raw = bin2hex(random_bytes(32));

        AuthToken::query()->create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $raw),
            'last_used_at' => now(),
            'expires_at' => null,
        ]);

        return $raw;
    }

    /** Revoke the presented raw token (no-op for empty/missing). */
    public function revoke(?string $raw): void
    {
        if ($raw === null || $raw === '') {
            return;
        }

        AuthToken::query()->where('token_hash', hash('sha256', $raw))->delete();
    }

    /** @return array{id: int, name: string, email: string, isAdmin: bool} */
    public function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'isAdmin' => (bool) $user->is_admin,
        ];
    }
}
