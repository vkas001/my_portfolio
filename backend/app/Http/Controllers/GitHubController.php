<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubController extends Controller
{
    private const CACHE_KEY = 'github_stats';
    private const TTL_SECONDS = 600; // 10 minutes

    public function stats(): JsonResponse
    {
        if ($cached = Cache::get(self::CACHE_KEY)) {
            return response()->json(['ok' => true, 'data' => $cached]);
        }

        $username = config('services.github.username');
        if (! $username) {
            return response()->json(['ok' => false, 'error' => 'GITHUB_USERNAME not configured'], 404);
        }

        try {
            $headers = ['Accept' => 'application/vnd.github+json'];
            if ($token = config('services.github.token')) {
                $headers['Authorization'] = "Bearer {$token}";
            }

            $userResponse = Http::withHeaders($headers)
                ->timeout(10)
                ->get("https://api.github.com/users/{$username}");

            if ($userResponse->failed()) {
                throw new \RuntimeException("GitHub user lookup failed ({$userResponse->status()})");
            }

            $reposResponse = Http::withHeaders($headers)
                ->timeout(10)
                ->get("https://api.github.com/users/{$username}/repos", [
                    'per_page' => 100,
                    'sort' => 'updated',
                ]);

            $user = $userResponse->json();
            $repos = $reposResponse->successful() ? $reposResponse->json() : [];

            $langCount = [];
            foreach ($repos as $repo) {
                if (! empty($repo['language'])) {
                    $langCount[$repo['language']] = ($langCount[$repo['language']] ?? 0) + 1;
                }
            }
            $total = array_sum($langCount) ?: 1;
            arsort($langCount);

            $stats = [
                'username' => $username,
                'publicRepos' => $user['public_repos'] ?? 0,
                'followers' => $user['followers'] ?? 0,
                'starsEarned' => array_sum(array_column($repos, 'stargazers_count')),
                'contributionsLastYear' => 0, // requires GraphQL; left for future enhancement
                'languages' => collect($langCount)
                    ->take(5)
                    ->map(fn ($count, $name) => ['name' => $name, 'percent' => (int) round(($count / $total) * 100)])
                    ->values()
                    ->all(),
                'contributions' => [],
                'fetchedAt' => now()->toIso8601String(),
            ];

            Cache::put(self::CACHE_KEY, $stats, now()->addSeconds(self::TTL_SECONDS));

            return response()->json(['ok' => true, 'data' => $stats]);
        } catch (\Throwable $e) {
            Log::error('[github] '.$e->getMessage());

            return response()->json(['ok' => false, 'error' => 'GitHub API unavailable'], 502);
        }
    }
}
