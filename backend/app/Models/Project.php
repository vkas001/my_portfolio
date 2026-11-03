<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = [
        'id', 'title', 'description', 'long_description', 'tech_stack', 'category',
        'featured', 'is_client', 'live_url', 'github_url', 'image_url', 'screenshots',
        'year', 'order',
    ];

    /** camelCase API attributes matching the shared Project type. */
    protected $appends = ['longDescription', 'techStack', 'isClient', 'liveUrl', 'githubUrl', 'imageUrl', 'screenshots'];

    protected $hidden = [
        'long_description', 'tech_stack', 'is_client', 'live_url', 'github_url', 'image_url',
        'created_at', 'updated_at',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'id';

    protected function casts(): array
    {
        return [
            'tech_stack' => 'array',
            'screenshots' => 'array',
            'featured' => 'boolean',
            'is_client' => 'boolean',
            'year' => 'integer',
            'order' => 'integer',
        ];
    }

    public function getLongDescriptionAttribute(): string
    {
        return (string) $this->attributes['long_description'];
    }

    public function getTechStackAttribute(): array
    {
        return json_decode((string) $this->attributes['tech_stack'], true) ?: [];
    }

    public function getIsClientAttribute(): bool
    {
        return (bool) ($this->attributes['is_client'] ?? false);
    }

    public function getScreenshotsAttribute(): array
    {
        return json_decode((string) ($this->attributes['screenshots'] ?? ''), true) ?: [];
    }

    public function getLiveUrlAttribute(): ?string
    {
        return $this->attributes['live_url'];
    }

    public function getGithubUrlAttribute(): ?string
    {
        return $this->attributes['github_url'];
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->attributes['image_url'];
    }
}
