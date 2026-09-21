<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Mirrors the Express backend's `cors({ origin: process.env.CORS_ORIGIN })`.
    |
    */

    'paths' => ['api/*', 'up'],

    'allowed_methods' => ['*'],

    /*
    | Comma-separated list in CORS_ORIGIN, e.g.:
    |   CORS_ORIGIN=http://localhost:3000,http://10.20.30.25:3000
    */
    'allowed_origins' => array_filter(array_map(
        trim(...),
        explode(',', (string) env('CORS_ORIGIN', 'http://localhost:3000')),
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
