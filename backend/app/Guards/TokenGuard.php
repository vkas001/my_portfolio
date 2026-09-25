<?php

namespace App\Guards;

use App\Models\AuthToken;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;

/**
 * Hand-rolled bearer-token guard (no Sanctum/Passport — single-admin
 * portfolio). Resolves the user from the sha256 hash of the Bearer token,
 * mirroring ibiz_v2's custom-guard pattern without the tier/claim machinery.
 *
 * The current Request is resolved from the container at call time instead of
 * being captured at construction: AuthManager caches a guard instance, so a
 * captured request would go stale across requests (visible in tests).
 */
class TokenGuard implements Guard
{
    use GuardHelpers;

    private bool $userSetExplicitly = false;

    public function __construct(UserProvider $provider)
    {
        $this->provider = $provider;
    }

    /**
     * Stateless: always re-resolve from the CURRENT request's bearer token so
     * a token revoked mid-process (or a stale guard cached by AuthManager
     * across test requests) never authenticates. An explicitly-set user
     * (actingAs / setUser) wins.
     */
    public function user(): ?Authenticatable
    {
        if ($this->userSetExplicitly) {
            return $this->user;
        }

        $token = $this->bearerToken();

        if ($token === null || $token === '') {
            return null;
        }

        $row = AuthToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->with('user')
            ->first();

        if ($row === null || $row->isExpired() || $row->user === null) {
            return null;
        }

        $row->update(['last_used_at' => now()]);

        return $this->user = $row->user;
    }

    /**
     * @param  Authenticatable  $user
     */
    public function setUser($user)
    {
        $this->user = $user;
        $this->userSetExplicitly = true;

        return $this;
    }

    public function validate(array $credentials = []): bool
    {
        return false;
    }

    private function bearerToken(): ?string
    {
        $request = app('request');

        return $request instanceof Request ? $request->bearerToken() : null;
    }
}
