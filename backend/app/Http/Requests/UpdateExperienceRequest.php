<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['sometimes', 'string', 'max:64', 'alpha_dash', Rule::unique('experience', 'id')->ignore($this->route('experience'), 'id')],
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
        ];
    }
}
