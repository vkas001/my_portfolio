<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Single-admin auth (hand-rolled bearer tokens; Sanctum/Passport dropped
 * per project conventions). Visitors never reach these endpoints from UI
 * unless signed in — and only admins may persist theme state.
 */
class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->attempt($request->validated('email'), $request->validated('password'));

        if ($result === null) {
            return response()->json(['error' => 'Invalid credentials.'], 401);
        }

        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->auth->userPayload($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->revoke($request->bearerToken());

        return response()->json(['signed_out' => true]);
    }
}
