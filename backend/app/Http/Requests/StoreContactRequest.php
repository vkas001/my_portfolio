<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Mirrors the Express zod schema: name 2-100, email max 200,
     * subject 2-150, message 10-5000, hidden honeypot field must be empty.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:200'],
            'subject' => ['required', 'string', 'min:2', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'honeypot' => [Rule::prohibitedIf(fn () => filled($this->input('honeypot')))],
        ];
    }

    public function messages(): array
    {
        return ['honeypot.prohibited' => 'Spam detected.'];
    }
}
