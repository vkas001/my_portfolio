<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Minimal RBAC gate (mirrors ibiz_v2's `permission:` middleware). The
 * project is single-user: the admin holds every permission in
 * PermissionRegistry, so the check reduces to whether the authenticated
 * user is an admin. Guests/no-token → 403 envelope.
 */
class RequirePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if ($user === null || ! (bool) $user->is_admin) {
            return response()->json(['error' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
