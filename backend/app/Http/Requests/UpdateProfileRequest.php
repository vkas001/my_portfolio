<?php

namespace App\Http\Requests;

use App\Models\Profile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'shortBio' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'personalNote' => ['nullable', 'string'],
            'strengths' => ['nullable', 'array', 'max:20'],
            'strengths.*' => ['string', 'max:500'],
            'openToWork' => ['nullable', 'string', 'max:100'],
            'strengthsTitle' => ['nullable', 'string', 'max:100'],
            'strengthsIcon' => ['nullable', Rule::in(Profile::SECTION_ICONS)],
            'personalNoteTitle' => ['nullable', 'string', 'max:100'],
            'personalNoteIcon' => ['nullable', Rule::in(Profile::SECTION_ICONS)],
            'avatarUrl' => ['nullable', 'string', 'max:511'],
            'resumeUrl' => ['nullable', 'string', 'max:511'],
            'email' => ['required', 'email', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'yearsExperience' => ['required', 'integer', 'min:0', 'max:60'],
            'socials' => ['present', 'array'],
            'socials.*.id' => ['nullable', 'string', 'max:64'],
            'socials.*.label' => ['required', 'string', 'max:100'],
            'socials.*.url' => ['required', 'string', 'max:511'],
            'socials.*.icon' => ['required', Rule::in(Profile::SOCIAL_ICONS)],
        ];
    }
}
