<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors the Express backend's response envelope:
 *   success → { ok: true, data: ... }
 *   error   → { ok: false, error: "..." }
 */
class ApiResponseEnvelope
{
    public function handle(Request $request, Closure $next): Response
    {
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
