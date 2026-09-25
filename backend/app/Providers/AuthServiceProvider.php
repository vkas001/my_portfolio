<?php

namespace App\Providers;

use App\Guards\TokenGuard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

/**
 * Registers the hand-rolled bearer-token guard under the `tokens` driver so
 * `auth:api`, `$request->user()` and `Auth::check()` all work natively
 * (ibiz_v2 registers its custom tiered guard the same way).
 */
class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Auth::extend('tokens', function ($app, $name, array $config) {
            return new TokenGuard(
                $app['auth']->createUserProvider($config['provider']),
            );
        });
    }
}
