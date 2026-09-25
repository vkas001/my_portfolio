<?php

namespace App\Http\Requests;

use App\Models\Hobby;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHobbyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['sometimes', 'string', 'max:64', 'alpha_dash', Rule::unique('hobbies', 'id')->ignore($this->route('hobby'), 'id')],
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['required', Rule::in(Hobby::ICONS)],
            'description' => ['nullable', 'string', 'max:2000'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
