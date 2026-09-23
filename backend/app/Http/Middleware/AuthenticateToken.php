<?php

namespace App\Http\Middleware;

use App\Models\AuthToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hand-rolled bearer-token auth (no Sanctum — single-admin portfolio).
 * Resolves the user from the sha256 hash of the Bearer token and makes
 * them available via $request->user(). Admin-only routes additionally
 * assert $user->is_admin in the controller.
 */
class AuthenticateToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null || $token === '') {
            return response()->json(['ok' => false, 'error' => 'Unauthenticated.'], 401);
        }

        $row = AuthToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->with('user')
            ->first();

        if ($row === null || $row->isExpired() || $row->user === null) {
            // Best-effort cleanup of stale rows; never leak which check failed.
            return response()->json(['ok' => false, 'error' => 'Unauthenticated.'], 401);
        }

        $row->update(['last_used_at' => now()]);
        $request->setUserResolver(fn () => $row->user);

        return $next($request);
    }
}
