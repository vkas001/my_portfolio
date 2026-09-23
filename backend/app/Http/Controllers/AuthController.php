<?php

namespace App\Http\Controllers;

use App\Models\AuthToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Single-admin auth (hand-rolled bearer tokens; Sanctum/Passport dropped
 * per project conventions). Visitors never reach these endpoints from UI
 * unless signed in — and only admins may persist theme state.
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Identifier only — the admin account's email is literally "admin",
            // so no email-format rule.
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        // Constant-time failure: same response whether the email or the
        // password is wrong so accounts can't be enumerated.
        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'ok' => false,
                'error' => 'Invalid credentials.',
            ], 401);
        }

        $raw = bin2hex(random_bytes(32));

        AuthToken::query()->create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $raw),
            'last_used_at' => now(),
            'expires_at' => null,
        ]);

        return response()->json([
            'ok' => true,
            'data' => [
                'token' => $raw,
                'user' => $this->userPayload($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'data' => ['user' => $this->userPayload($request->user())],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if ($token !== null && $token !== '') {
            AuthToken::query()->where('token_hash', hash('sha256', $token))->delete();
        }

        return response()->json([
            'ok' => true,
            'data' => ['signed_out' => true],
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'isAdmin' => (bool) $user->is_admin,
        ];
    }
}
