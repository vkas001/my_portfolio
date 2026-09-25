<?php

use App\Http\Middleware\ApiResponseEnvelope;
use App\Http\Middleware\RequirePermission;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Wrap every JSON response in the { ok, data } / { ok, error } envelope
        // the frontend expects (mirrors the old Express API).
        $middleware->append(ApiResponseEnvelope::class);

        // Bearer-token auth uses the real `api` guard (TokenGuard). Guests
        // hit null; `permission:` asserts the single-admin's is_admin flag.
        $middleware->alias([
            'auth' => Authenticate::class,
            'permission' => RequirePermission::class,
        ]);

        // Pure API — no web login route exists, so never redirect guests
        // (the framework default `route('login')` 500s); return null → 401 JSON.
        $middleware->redirectGuestsTo(fn () => null);

        // 120 requests/minute across /api (limiter defined in AppServiceProvider).
        $middleware->group('api', [
            'throttle:api',
            SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
