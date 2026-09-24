<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SocialLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Admin-only portfolio content CRUD. Every route sits behind the
 * `auth.token` middleware — guests get a 401 envelope. Writes mirror the
 * camelCase API shapes in shared/src/types.ts (validate the same names the
 * GET endpoints return).
 */
class AdminController extends Controller
{
    private const SKILL_CATEGORIES = [
        'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
    ];

    private const SOCIAL_ICONS = ['github', 'linkedin', 'twitter', 'website', 'email'];

    /** Lucide icon names the About headings may use (matches frontend SECTION_ICONS). */
    private const SECTION_ICONS = [
        'none', 'star', 'sparkles', 'zap', 'rocket', 'award', 'target', 'shield', 'gem', 'lightbulb', 'layers',
    ];

    // ─── Profile ─────────────────────────────────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'shortBio' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'personalNote' => ['nullable', 'string'],
            'strengths' => ['nullable', 'array', 'max:20'],
            'strengths.*' => ['string', 'max:500'],
            'openToWork' => ['nullable', 'string', 'max:100'],
            'strengthsTitle' => ['nullable', 'string', 'max:100'],
            'strengthsIcon' => ['nullable', Rule::in(self::SECTION_ICONS)],
            'personalNoteTitle' => ['nullable', 'string', 'max:100'],
            'personalNoteIcon' => ['nullable', Rule::in(self::SECTION_ICONS)],
            'avatarUrl' => ['nullable', 'string', 'max:511'],
            'resumeUrl' => ['nullable', 'string', 'max:511'],
            'email' => ['required', 'email', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'yearsExperience' => ['required', 'integer', 'min:0', 'max:60'],
            'socials' => ['present', 'array'],
            'socials.*.id' => ['nullable', 'string', 'max:64'],
            'socials.*.label' => ['required', 'string', 'max:100'],
            'socials.*.url' => ['required', 'string', 'max:511'],
            'socials.*.icon' => ['required', Rule::in(self::SOCIAL_ICONS)],
        ]);

        $profile = Profile::query()->updateOrCreate(
            ['id' => 'me'],
            [
                'name' => $data['name'],
                'title' => $data['title'],
                'short_bio' => $data['shortBio'] ?? null,
                'bio' => $data['bio'] ?? null,
                'personal_note' => $data['personalNote'] ?? null,
                'strengths' => $data['strengths'] ?? [],
                'open_to_work' => $data['openToWork'] ?? null,
                'strengths_title' => $data['strengthsTitle'] ?? null,
                'strengths_icon' => $data['strengthsIcon'] ?? null,
                'personal_note_title' => $data['personalNoteTitle'] ?? null,
                'personal_note_icon' => $data['personalNoteIcon'] ?? null,
                'avatar_url' => $data['avatarUrl'] ?? null,
                'resume_url' => $data['resumeUrl'] ?? null,
                'email' => $data['email'],
                'location' => $data['location'],
                'years_experience' => $data['yearsExperience'],
            ],
        );

        // Replace-whole social list (single-author, keep simple + deterministic).
        $profile->socials()->delete();
        $order = 0;
        foreach ($data['socials'] as $social) {
            SocialLink::query()->create([
                'id' => $social['id'] ?? 's'.substr(md5($social['label'].$order), 0, 8),
                'profile_id' => 'me',
                'label' => $social['label'],
                'url' => $social['url'],
                'icon' => $social['icon'],
            ]);
            $order++;
        }

        return response()->json(['ok' => true, 'data' => $profile->refresh()->load('socials')]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => ['required', 'image'],
        ]);

        $profile = Profile::query()->where('id', 'me')->first();

        // Fresh DB (never seeded) — create the profile row so the avatar has
        // a home instead of 500ing on the NOT NULL columns.
        if (! $profile) {
            $profile = Profile::query()->create([
                'id' => 'me',
                'name' => 'Portfolio',
                'title' => '',
                'email' => '',
                'location' => '',
            ]);
        }

        // Replacing an uploaded avatar — clear the previous stored file so
        // old images don't pile up on disk (only ours, under /storage/avatars).
        $marker = '/storage/';
        $pos = is_string($profile->avatar_url) ? strpos($profile->avatar_url, $marker) : false;
        if ($pos !== false) {
            Storage::disk('public')->delete(substr($profile->avatar_url, $pos + strlen($marker)));
        }

        $path = $data['image']->store('avatars', 'public');

        $profile->forceFill(['avatar_url' => '/storage/'.$path])->save();

        return response()->json(['ok' => true, 'data' => $profile->refresh()->load('socials')]);
    }

    // ─── Skills ──────────────────────────────────────────────────────────────

    public function storeSkill(Request $request): JsonResponse
    {
        $data = $this->validateSkill($request);

        $skill = Skill::query()->create([
            'id' => $data['id'],
            'name' => $data['name'],
            'category' => $data['category'],
            'proficiency' => $data['proficiency'],
            'years_used' => $data['yearsUsed'] ?? 0,
            'icon' => $data['icon'] ?? null,
        ]);

        return response()->json(['ok' => true, 'data' => $skill->refresh()]);
    }

    public function updateSkill(Request $request, string $id): JsonResponse
    {
        $skill = Skill::query()->findOrFail($id);
        $data = $this->validateSkill($request);

        $skill->fill([
            'name' => $data['name'],
            'category' => $data['category'],
            'proficiency' => $data['proficiency'],
            'years_used' => $data['yearsUsed'] ?? 0,
            'icon' => $data['icon'] ?? null,
        ])->save();

        return response()->json(['ok' => true, 'data' => $skill->refresh()]);
    }

    public function destroySkill(string $id): JsonResponse
    {
        Skill::query()->findOrFail($id)->delete();

        return response()->json(['ok' => true, 'data' => ['id' => $id]]);
    }

    private function validateSkill(Request $request): array
    {
        $id = $request->route('skill');
        $data = $request->validate([
            'id' => $id
                ? ['sometimes', 'string', 'max:64', 'alpha_dash']
                : ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('skills', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(self::SKILL_CATEGORIES)],
            'proficiency' => ['required', 'integer', 'min:0', 'max:100'],
            'yearsUsed' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'icon' => ['nullable', 'string', 'max:64'],
        ]);

        $data['id'] = $id ?? $request->input('id');

        return $data;
    }

    // ─── Projects ────────────────────────────────────────────────────────────

    public function storeProject(Request $request): JsonResponse
    {
        $data = $this->validateProject($request);

        $project = Project::query()->create([
            'id' => $data['id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'long_description' => $data['longDescription'] ?? null,
            'tech_stack' => $data['techStack'] ?? [],
            'category' => $data['category'],
            'featured' => $data['featured'] ?? false,
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'year' => $data['year'],
            'order' => $data['order'] ?? Project::query()->max('order') + 1,
        ]);

        return response()->json(['ok' => true, 'data' => $project->refresh()]);
    }

    public function updateProject(Request $request, string $id): JsonResponse
    {
        $project = Project::query()->findOrFail($id);
        $data = $this->validateProject($request);

        $project->fill([
            'title' => $data['title'],
            'description' => $data['description'],
            'long_description' => $data['longDescription'] ?? null,
            'tech_stack' => $data['techStack'] ?? [],
            'category' => $data['category'],
            'featured' => $data['featured'] ?? false,
            'live_url' => $data['liveUrl'] ?? null,
            'github_url' => $data['githubUrl'] ?? null,
            'image_url' => $data['imageUrl'] ?? null,
            'year' => $data['year'],
            'order' => $data['order'] ?? $project->order,
        ])->save();

        return response()->json(['ok' => true, 'data' => $project->refresh()]);
    }

    public function destroyProject(string $id): JsonResponse
    {
        Project::query()->findOrFail($id)->delete();

        return response()->json(['ok' => true, 'data' => ['id' => $id]]);
    }

    private function validateProject(Request $request): array
    {
        $id = $request->route('project');
        $data = $request->validate([
            'id' => $id
                ? ['sometimes', 'string', 'max:64', 'alpha_dash']
                : ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('projects', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'longDescription' => ['nullable', 'string'],
            'techStack' => ['nullable', 'array'],
            'techStack.*' => ['string', 'max:100'],
            'category' => ['required', 'string', 'max:100'],
            'featured' => ['nullable', 'boolean'],
            'liveUrl' => ['nullable', 'string', 'max:511'],
            'githubUrl' => ['nullable', 'string', 'max:511'],
            'imageUrl' => ['nullable', 'string', 'max:511'],
            'year' => ['required', 'integer', 'min:1990', 'max:2100'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['id'] = $id ?? $request->input('id');

        return $data;
    }

    // ─── Experience ──────────────────────────────────────────────────────────

    public function storeExperience(Request $request): JsonResponse
    {
        $data = $this->validateExperience($request);

        $experience = Experience::query()->create([
            'id' => $data['id'],
            'company' => $data['company'],
            'role' => $data['role'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'location' => $data['location'],
            'employment_type' => $data['employmentType'],
            'highlights' => $data['highlights'] ?? [],
            'tech_stack' => $data['techStack'] ?? [],
            'order' => $data['order'] ?? Experience::query()->max('order') + 1,
        ]);

        return response()->json(['ok' => true, 'data' => $experience->refresh()]);
    }

    public function updateExperience(Request $request, string $id): JsonResponse
    {
        $experience = Experience::query()->findOrFail($id);
        $data = $this->validateExperience($request);

        $experience->fill([
            'company' => $data['company'],
            'role' => $data['role'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'] ?? null,
            'location' => $data['location'],
            'employment_type' => $data['employmentType'],
            'highlights' => $data['highlights'] ?? [],
            'tech_stack' => $data['techStack'] ?? [],
            'order' => $data['order'] ?? $experience->order,
        ])->save();

        return response()->json(['ok' => true, 'data' => $experience->refresh()]);
    }

    public function destroyExperience(string $id): JsonResponse
    {
        Experience::query()->findOrFail($id)->delete();

        return response()->json(['ok' => true, 'data' => ['id' => $id]]);
    }

    private function validateExperience(Request $request): array
    {
        $id = $request->route('experience');
        $data = $request->validate([
            'id' => $id
                ? ['sometimes', 'string', 'max:64', 'alpha_dash']
                : ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('experience', 'id')],
            'company' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'startDate' => ['required', 'date_format:Y-m-d'],
            'endDate' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:startDate'],
            'location' => ['required', 'string', 'max:255'],
            'employmentType' => ['required', 'string', 'max:100'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['string', 'max:2000'],
            'techStack' => ['nullable', 'array'],
            'techStack.*' => ['string', 'max:100'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['id'] = $id ?? $request->input('id');

        return $data;
    }
}
