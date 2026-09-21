<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function profile(): JsonResponse
    {
        $profile = Profile::query()
            ->with('socials')
            ->first();

        // Mirror the Express API: 404 when not configured.
        if (! $profile) {
            return response()->json(['ok' => false, 'error' => 'Profile not found'], 404);
        }

        return response()->json(['ok' => true, 'data' => $profile]);
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

        return response()->json(['ok' => true, 'data' => $skills]);
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

        return response()->json(['ok' => true, 'data' => $projects]);
    }

    public function experience(): JsonResponse
    {
        $experience = Experience::query()
            ->orderBy('order')
            ->get();

        return response()->json(['ok' => true, 'data' => $experience]);
    }
}
