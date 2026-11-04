<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Hobby;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Public read endpoints — no auth. Returns plain payloads; the global
 * ApiResponseEnvelope wraps them so the wire shape is `{ ok, data }`.
 */
class PortfolioController extends Controller
{
    public function profile(): JsonResponse
    {
        $profile = Profile::query()
            ->with('socials')
            ->first();

        // Mirror the Express API: 404 when not configured.
        if (! $profile) {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        return response()->json($profile);
    }

    /** Stream the uploaded CV as a download (the header/About CTAs hit this). */
    public function resume(): Response
    {
        $profile = Profile::query()->first();
        $url = $profile?->resume_url;

        abort_unless(is_string($url) && str_starts_with($url, '/storage/'), 404);

        $path = substr($url, strlen('/storage/'));
        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $slug = Str::slug($profile->name ?: '') ?: 'resume';
        $filename = $slug.'-cv'.($extension ? '.'.$extension : '');

        return $disk->download($path, $filename);
    }

    public function skills(Request $request): JsonResponse
    {
        $skills = Skill::query()
            ->when(
                $request->query('category'),
                fn ($query, $category) => $query->where('category', $category),
            )
            ->orderBy('id')
            ->get();

        return response()->json($skills);
    }

    public function projects(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->when(
                $request->query('category'),
                fn ($query, $category) => $query->where('category', $category),
            )
            ->when(
                $request->query('featured') === 'true',
                fn ($query) => $query->where('featured', true),
            )
            ->orderBy('order')
            ->get();

        return response()->json($projects);
    }

    public function experience(): JsonResponse
    {
        $experience = Experience::query()
            ->orderBy('order')
            ->get();

        return response()->json($experience);
    }

    public function education(): JsonResponse
    {
        $education = Education::query()
            ->orderBy('order')
            ->get();

        return response()->json($education);
    }

    public function hobbies(): JsonResponse
    {
        $hobbies = Hobby::query()
            ->orderBy('order')
            ->get();

        return response()->json($hobbies);
    }

    public function blogs(): JsonResponse
    {
        $blogs = Blog::query()
            ->where('published', true)
            ->orderBy('order')
            ->get();

        return response()->json($blogs);
    }

    /**
     * Public RSS 2.0 feed of published posts (hand-built XML, no new deps).
     * Passes through ApiResponseEnvelope untouched (non-JSON responses
     * bypass it). Item links land on the site's writing section — there are
     * no per-post routes by design.
     */
    public function blogFeed(): Response
    {
        $author = Profile::query()->first()?->name ?? 'Portfolio';
        $siteUrl = rtrim((string) config('app.url'), '/');
        $posts = Blog::query()->where('published', true)->orderBy('order')->get();

        $esc = fn (?string $v): string => htmlspecialchars((string) $v, ENT_XML1 | ENT_COMPAT, 'UTF-8');
        $items = $posts->map(function (Blog $post) use ($esc, $siteUrl) {
            $desc = $post->excerpt;
            if (! $desc) {
                $plain = trim((string) preg_replace('/\s+/', ' ', strip_tags((string) $post->body)));
                $desc = mb_substr($plain, 0, 200);
            }
            try {
                $pubDate = (new \DateTime((string) ($post->published_at ?? $post->created_at)))->format(DATE_RFC2822);
            } catch (\Throwable) {
                $pubDate = gmdate(DATE_RFC2822);
            }
            $cats = collect($post->tags)
                ->map(fn ($t) => "<category>{$esc($t)}</category>")
                ->implode("\n");
            $title = $esc($post->title);
            $link = $esc($siteUrl).'/#site-writing';
            $guid = $esc($post->id);
            $desc = $esc($desc);

            return <<<XML
                <item>
                  <title>{$title}</title>
                  <link>{$link}</link>
                  <guid isPermaLink="false">{$guid}</guid>
                  <pubDate>{$pubDate}</pubDate>
                  <description>{$desc}</description>
                {$cats}
                </item>
                XML;
        })->implode("\n");

        $channelTitle = $esc($author).' — Blog';
        $channelLink = $esc($siteUrl);
        $channelDesc = $esc('Posts by '.$author);
        $xml = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>{$channelTitle}</title>
            <link>{$channelLink}</link>
            <description>{$channelDesc}</description>
            <language>en</language>
        {$items}
          </channel>
        </rss>
        XML;

        return response($xml, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }
}
