<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GitHub public-profile widget stats (10-minute cache; graceful 404/502
 * when username unset or the API fails). ibiz's GitHubService kept minimal.
 */
class GitHubStatsService
{
    private const CACHE_KEY = 'github_stats';

    private const TTL_SECONDS = 600;

    /** @return array<string, mixed> */
    public function stats(): array
    {
        if ($cached = Cache::get(self::CACHE_KEY)) {
            return $cached;
        }

        $username = config('services.github.username');
        if (! $username) {
            throw new GitHubUnavailableException('GITHUB_USERNAME not configured', 404);
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
                throw new GitHubUnavailableException("GitHub user lookup failed ({$userResponse->status()})", 502);
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
                'forksEarned' => array_sum(array_column($repos, 'forks_count')),
                'contributionsLastYear' => 0,
                'languages' => collect($langCount)
                    ->take(5)
                    ->map(fn ($count, $name) => ['name' => $name, 'percent' => (int) round(($count / $total) * 100)])
                    ->values()
                    ->all(),
                'contributions' => [],
                'fetchedAt' => now()->toIso8601String(),
            ];

            // Contribution calendars exist only behind the GraphQL API (needs
            // a token). Absent token or any failure keeps the zeros above —
            // the REST payload must never break because of this.
            if ($token = config('services.github.token')) {
                try {
                    $stats = array_merge($stats, $this->contributionStats($username, $token));
                } catch (\Throwable $e) {
                    Log::warning('[github] contributions unavailable: '.$e->getMessage());
                }
            }

            Cache::put(self::CACHE_KEY, $stats, now()->addSeconds(self::TTL_SECONDS));

            return $stats;
        } catch (\Throwable $e) {
            Log::error('[github] '.$e->getMessage());

            throw new GitHubUnavailableException('GitHub API unavailable', 502);
        }
    }

    /**
     * Contribution calendar via the GraphQL API (REST has no equivalent).
     * Returns zeros when the shape is unexpected — never throws past the
     * caller-visible HTTP failures.
     *
     * @return array{contributionsLastYear: int, contributions: list<array{date: string, count: int}>}
     */
    private function contributionStats(string $username, string $token): array
    {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github+json',
            'Authorization' => "Bearer {$token}",
        ])
            ->timeout(10)
            ->post('https://api.github.com/graphql', [
                'query' => <<<'GRAPHQL'
                    query ($login: String!) {
                      user(login: $login) {
                        contributionsCollection {
                          contributionCalendar {
                            totalContributions
                            weeks { contributionDays { date contributionCount } }
                          }
                        }
                      }
                    }
                    GRAPHQL,
                'variables' => ['login' => $username],
            ]);

        if ($response->failed()) {
            throw new GitHubUnavailableException("GitHub GraphQL failed ({$response->status()})", 502);
        }

        $calendar = $response->json('data.user.contributionsCollection.contributionCalendar');
        if (! is_array($calendar)) {
            return ['contributionsLastYear' => 0, 'contributions' => []];
        }

        $days = [];
        foreach ($calendar['weeks'] ?? [] as $week) {
            foreach ($week['contributionDays'] ?? [] as $day) {
                if (! isset($day['date'])) {
                    continue;
                }
                $days[] = ['date' => $day['date'], 'count' => (int) ($day['contributionCount'] ?? 0)];
            }
        }

        return [
            'contributionsLastYear' => (int) ($calendar['totalContributions'] ?? 0),
            'contributions' => $days,
        ];
    }
}
