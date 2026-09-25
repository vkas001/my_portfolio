<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors the Express backend's response envelope:
 *   success → { ok: true, data: ... }
 *   error   → { ok: false, error: "..." }
 *
 * Global for /api only — web responses (Scramble's /docs/*) pass through raw.
 */
class ApiResponseEnvelope
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('api/*')) {
            return $next($request);
        }

        $response = $next($request);

        if (! $response instanceof JsonResponse) {
            return $response;
        }

        $body = $response->getData(true);

        if (array_key_exists('ok', $body)) {
            return $response; // already enveloped (controller or exception renderer)
        }

        if ($response->isSuccessful() || $response->getStatusCode() < 400) {
            $response->setData(['ok' => true, 'data' => $body]);
        } else {
            // Convert error bodies like {"message": "...", "errors": {...}} into
            // {"ok": false, "error": "field: msg; ..."} — mirrors the Express
            // zod error format.
            if (isset($body['errors']) && is_array($body['errors'])) {
                $error = collect($body['errors'])
                    ->map(fn ($msgs, $field) => $field.': '.implode(', ', (array) $msgs))
                    ->implode('; ');
            } else {
                $error = $body['message'] ?? $body['error'] ?? 'Request failed';
            }

            $response->setData(['ok' => false, 'error' => $error]);
        }

        return $response;
    }
}
