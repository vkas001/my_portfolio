<?php

namespace App\Http\Controllers;

use App\Models\Education;
use App\Models\Experience;
use App\Models\Hobby;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
