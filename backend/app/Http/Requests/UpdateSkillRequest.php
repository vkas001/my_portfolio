<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['sometimes', 'string', 'max:64', 'alpha_dash', Rule::unique('skills', 'id')->ignore($this->route('skill'), 'id')],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:40'],
            'proficiency' => ['required', 'integer', 'min:0', 'max:100'],
            'yearsUsed' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'icon' => ['nullable', 'string', 'max:64'],
        ];
    }
}
