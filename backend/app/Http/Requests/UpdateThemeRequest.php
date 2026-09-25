<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => ['sometimes', 'string', 'in:light,dark'],
            'accent' => ['sometimes', 'string'],
            'customAccent' => ['sometimes', 'nullable', 'string', 'max:20'],
            'glass' => ['sometimes', 'string', 'in:subtle,normal,strong'],
            'blur' => ['sometimes', 'string', 'in:normal,high,ultra'],
            'radius' => ['sometimes', 'string', 'in:sharp,rounded,pill'],
            'font' => ['sometimes', 'string', 'max:40'],
            'density' => ['sometimes', 'string', 'in:compact,normal,comfortable'],
            'gridSize' => ['sometimes', 'integer', 'in:16,24,32'],
            'windowOpacity' => ['sometimes', 'numeric', 'min:0.5', 'max:1'],
            'showTopBar' => ['sometimes', 'boolean'],
            'wallpaper' => ['sometimes', 'string', 'max:60'],
            'wallpaperDim' => ['sometimes', 'numeric', 'min:0', 'max:60'],
            'wallpaperBlur' => ['sometimes', 'numeric', 'min:0', 'max:25'],
            'taskbarMode' => ['sometimes', 'string', 'in:always,auto-hide'],
            'taskbarStyle' => ['sometimes', 'string', 'in:macos,windows'],
            'taskbarApps' => ['sometimes', 'array'],
            'showHomeIndicator' => ['sometimes', 'boolean'],
            'showSeconds' => ['sometimes', 'boolean'],
            'animationsEnabled' => ['sometimes', 'boolean'],
            'soundsEnabled' => ['sometimes', 'boolean'],
            'volume' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'airplaneMode' => ['sometimes', 'boolean'],
            'widgets' => ['sometimes', 'array'],
            'startupWindows' => ['sometimes', 'array'],
            'clockFormat' => ['sometimes', 'string', 'in:12h,24h'],
            'dateFormat' => ['sometimes', 'string', 'in:short,long'],
        ];
    }
}
