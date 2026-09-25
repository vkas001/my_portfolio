<?php

namespace App\Http\Controllers;

use App\Services\Integrations\GitHubStatsService;
use App\Services\Integrations\GitHubUnavailableException;
use Illuminate\Http\JsonResponse;

class GitHubController extends Controller
{
    public function __construct(private readonly GitHubStatsService $github) {}

    public function stats(): JsonResponse
    {
        try {
            return response()->json($this->github->stats());
        } catch (GitHubUnavailableException $e) {
            return response()->json(['error' => $e->getMessage()], $e->status);
        }
    }
}
