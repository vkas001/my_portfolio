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
            'fontSize' => ['sometimes', 'string', 'in:small,medium,large'],
            'density' => ['sometimes', 'string', 'in:compact,normal,comfortable'],
            'gridSize' => ['sometimes', 'integer', 'in:16,24,32'],
            'windowOpacity' => ['sometimes', 'numeric', 'min:0.5', 'max:1'],
            'windowSize' => ['sometimes', 'string', 'in:small,medium,large'],
            'showTopBar' => ['sometimes', 'boolean'],
            'wallpaper' => ['sometimes', 'string', 'max:60'],
            'wallpaperImage' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^\//'],
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
            'splashWords' => ['sometimes', 'array', 'min:1', 'max:6'],
            'splashWords.*' => ['string', 'max:14'],
            // Nullable: clearing a line sends '' which the empty-string-to-null
            // middleware turns into null — without this the whole save 422s.
            'splashTagline' => ['sometimes', 'nullable', 'string', 'max:60'],
            'splashFooter' => ['sometimes', 'nullable', 'string', 'max:40'],
            'splashDuration' => ['sometimes', 'integer', 'min:1000', 'max:8000'],
            'splashBackground' => ['sometimes', 'string', 'in:midnight,onyx,indigo,abyss'],
            'splashBackgroundImage' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^\//'],
            'splashAccent' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'skillsDisplay' => ['sometimes', 'string', 'in:bars,cards'],
            'widgets' => ['sometimes', 'array'],
            'desktopIconOffsets' => ['sometimes', 'array'],
            'desktopIconSize' => ['sometimes', 'string', 'in:small,medium,large'],
            'taskbarIconSize' => ['sometimes', 'string', 'in:small,medium,large'],
            'startupWindows' => ['sometimes', 'array'],
            'clockFormat' => ['sometimes', 'string', 'in:12h,24h'],
            'dateFormat' => ['sometimes', 'string', 'in:short,long'],
        ];
    }
}
