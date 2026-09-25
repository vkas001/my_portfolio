<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['sometimes', 'string', 'max:64', 'alpha_dash', Rule::unique('educations', 'id')->ignore($this->route('education'), 'id')],
            'institution' => ['required', 'string', 'max:255'],
            'degree' => ['required', 'string', 'max:255'],
            'startDate' => ['required', 'date_format:Y-m-d'],
            'endDate' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:startDate'],
            'description' => ['nullable', 'string', 'max:5000'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
