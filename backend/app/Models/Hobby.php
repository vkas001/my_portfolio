<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hobby extends Model
{
    protected $table = 'hobbies';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'id';

    /** Lucide icon names a hobby may use (matches frontend HOBBY_ICONS). */
    public const ICONS = [
        'mountain', 'camera', 'book-open', 'gamepad', 'headphones', 'palette',
        'bike', 'plane', 'dumbbell', 'chef-hat', 'coffee', 'globe',
        'film', 'pen-tool', 'rocket', 'sparkles', 'code', 'music',
    ];

    protected $fillable = [
        'id', 'name', 'icon', 'description', 'order',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }
}
