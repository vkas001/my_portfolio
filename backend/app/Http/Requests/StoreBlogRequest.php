<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('blogs', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'body' => ['required', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:64'],
            'coverUrl' => ['nullable', 'string', 'max:2048'],
            'published' => ['nullable', 'boolean'],
            'publishedAt' => ['nullable', 'date'],
            'order' => ['nullable', 'integer', 'min:0', 'max:4294967295'],
        ];
    }
}
