<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    /** Accepted values for `category`, mirrored by the shared SkillCategory type. */
    public const CATEGORIES = [
        'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
    ];

    protected $table = 'skills';

    protected $hidden = ['created_at', 'updated_at', 'years_used'];

    /** API attribute (camelCase) matching the shared Skill type. */
    protected $appends = ['yearsUsed'];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'id';

    protected $fillable = ['id', 'name', 'category', 'proficiency', 'years_used', 'icon'];

    protected function casts(): array
    {
        return [
            'proficiency' => 'integer',
            'years_used' => 'decimal:1',
        ];
    }

    public function getYearsUsedAttribute(): float
    {
        return (float) $this->attributes['years_used'];
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
