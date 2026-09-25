<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('projects', 'id')],
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
        ];
    }
}
