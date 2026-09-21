<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'github' => [
        'username' => env('GITHUB_USERNAME'),
        'token' => env('GITHUB_TOKEN'),
    ],

    'contact' => [
        'to' => env('CONTACT_TO', 'you@example.com'),
        'from' => env('CONTACT_FROM', 'Portfolio <noreply@example.com>'),
    ],

];
