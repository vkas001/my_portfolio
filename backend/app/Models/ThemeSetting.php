<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemeSetting extends Model
{
    protected $table = 'theme_settings';

    protected $fillable = ['settings'];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }
}
