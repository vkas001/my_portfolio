<?php

namespace Tests\Feature;

use App\Services\Integrations\GitHubStatsService;
use App\Services\Integrations\GitHubUnavailableException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GitHubStatsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        config()->set('services.github.username', 'tester');
        config()->set('services.github.token', 'test-token');
    }

    /** @return array<string, mixed> */
    private function restStubs(): array
    {
        return [
            'api.github.com/users/tester' => Http::response([
                'public_repos' => 12,
                'followers' => 34,
            ], 200),
            'api.github.com/users/tester/repos*' => Http::response([
                ['language' => 'PHP', 'stargazers_count' => 10, 'forks_count' => 3],
                ['language' => 'TypeScript', 'stargazers_count' => 5, 'forks_count' => 2],
                ['language' => null, 'stargazers_count' => 0, 'forks_count' => 0],
            ], 200),
        ];
    }

    private function calendarStub(int $total = 9): array
    {
        return [
            'api.github.com/graphql' => Http::response([
                'data' => [
                    'user' => [
                        'contributionsCollection' => [
                            'contributionCalendar' => [
                                'totalContributions' => $total,
                                'weeks' => [
                                    ['contributionDays' => [
                                        ['date' => '2026-10-01', 'contributionCount' => 3],
                                        ['date' => '2026-10-02', 'contributionCount' => 0],
                                    ]],
                                    ['contributionDays' => [
                                        ['date' => '2026-10-03', 'contributionCount' => 6],
                                    ]],
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ];
    }

    public function test_maps_rest_graphql_and_forks(): void
    {
        Http::fake([...$this->restStubs(), ...$this->calendarStub()]);

        $stats = (new GitHubStatsService)->stats();

        $this->assertSame(12, $stats['publicRepos']);
        $this->assertSame(34, $stats['followers']);
        $this->assertSame(15, $stats['starsEarned']);
        $this->assertSame(5, $stats['forksEarned']);
        $this->assertSame(9, $stats['contributionsLastYear']);
        $this->assertSame([
            ['date' => '2026-10-01', 'count' => 3],
            ['date' => '2026-10-02', 'count' => 0],
            ['date' => '2026-10-03', 'count' => 6],
        ], $stats['contributions']);
    }

    public function test_without_token_returns_zeros_for_contributions(): void
    {
        config()->set('services.github.token', null);
        Http::fake($this->restStubs());

        $stats = (new GitHubStatsService)->stats();

        $this->assertSame(12, $stats['publicRepos']);
        $this->assertSame(5, $stats['forksEarned']);
        $this->assertSame(0, $stats['contributionsLastYear']);
        $this->assertSame([], $stats['contributions']);
    }

    public function test_graphql_failure_keeps_rest_payload(): void
    {
        Http::fake([
            ...$this->restStubs(),
            'api.github.com/graphql' => Http::response(null, 500),
        ]);

        $stats = (new GitHubStatsService)->stats();

        $this->assertSame(12, $stats['publicRepos']);
        $this->assertSame(0, $stats['contributionsLastYear']);
        $this->assertSame([], $stats['contributions']);
    }

    public function test_missing_username_throws_unavailable(): void
    {
        config()->set('services.github.username', null);

        $this->expectException(GitHubUnavailableException::class);

        (new GitHubStatsService)->stats();
    }
}
