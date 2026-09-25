<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // N+1 guard while developing — controls like 'me', the admin panel
        // and widgets would all catch lazy-loading bugs early.
        Model::preventLazyLoading(! $this->app->isProduction());

        $this->configureRateLimiting();
    }

    /**
     * Named rate limiters matching the Express backend:
     * - api:     120 requests/minute across /api
     * - contact: 5 requests per 10 minutes on POST /api/contact
     * - login:   5 attempts per minute on POST /api/auth/login
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'ok' => false,
                    'error' => 'Too many login attempts. Try again in a minute.',
                ], 429);
            });
        });

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinutes(10, 5) // 5 attempts per 10 minutes
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'ok' => false,
                        'error' => 'Too many contact attempts. Try again later.',
                    ], 429);
                });
        });
    }
}
