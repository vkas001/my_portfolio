<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $table = 'blogs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'title', 'excerpt', 'body', 'tags', 'cover_url',
        'published', 'published_at', 'order',
    ];

    protected $hidden = [
        'cover_url', 'published_at',
        'created_at', 'updated_at',
    ];

    /** camelCase API attributes matching the shared Blog type. `tags` needs
     *  no alias (single word) — the accessor below always serializes an
     *  array, even when the column is null. */
    protected $appends = ['coverUrl', 'publishedAt'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'published' => 'boolean',
            'published_at' => 'datetime',
            'order' => 'integer',
        ];
    }

    public function getTagsAttribute(): array
    {
        return json_decode((string) $this->attributes['tags'], true) ?: [];
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->attributes['cover_url'];
    }

    public function getPublishedAtAttribute(): ?string
    {
        return isset($this->attributes['published_at'])
            ? (string) $this->attributes['published_at']
            : null;
    }
}
