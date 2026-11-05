<?php

namespace App\Services\Profile;

use App\Models\Profile;
use App\Models\SocialLink;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Face the "who am I" content: update the single profile row plus its
 * replace-whole social list, and swap the avatar file on the public disk.
 */
class ProfileService
{
    /** @return Profile the updated/created profile with socials loaded. */
    public function update(array $data): Profile
    {
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

        return $profile->refresh()->load('socials');
    }

    /** @return Profile updated profile with socials loaded. */
    public function uploadAvatar(UploadedFile $image): Profile
    {
        $profile = $this->ensureProfile();

        // Replacing an uploaded avatar — clear the previous stored file so
        // old images don't pile up on disk (only ours, under /storage/avatars).
        $this->deleteStoredFile($profile->avatar_url, 'avatars');

        $path = $image->store('avatars', 'public');

        $profile->forceFill(['avatar_url' => '/storage/'.$path])->save();

        return $profile->refresh()->load('socials');
    }

    /** Fresh DB (never seeded) — create the profile row so uploads have a home. */
    private function ensureProfile(): Profile
    {
        return Profile::query()->where('id', 'me')->first()
            ?? Profile::query()->create([
                'id' => 'me',
                'name' => 'Portfolio',
                'title' => '',
                'email' => '',
                'location' => '',
            ]);
    }

    /** Delete a stored file when the URL points inside the given folder. */
    private function deleteStoredFile(?string $url, string $folder): void
    {
        $marker = '/storage/';

        if (is_string($url) && str_starts_with($url, $marker.$folder.'/')) {
            Storage::disk('public')->delete(substr($url, strlen($marker)));
        }
    }
}
