<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Matches the previous Express API 1:1. Every response is wrapped by the
| global ApiResponseEnvelope middleware as { ok: true, data } / { ok: false,
| error } — endpoints return plain payloads. Route groups mirror ibiz_v2:
| public portfolio reads, admin writes behind auth:api + permission:*.
|
*/

require __DIR__.'/api/health.php';
require __DIR__.'/api/auth.php';
require __DIR__.'/api/portfolio.php';
require __DIR__.'/api/contact.php';
require __DIR__.'/api/github.php';
require __DIR__.'/api/theme.php';
require __DIR__.'/api/admin.php';
