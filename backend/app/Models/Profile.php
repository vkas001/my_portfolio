<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profiles';

    protected $fillable = [
        'id', 'name', 'title', 'short_bio', 'bio', 'avatar_url', 'resume_url',
        'email', 'location', 'years_experience',
    ];

    /**
     * API attribute names (camelCase), matching the previous Express API and
     * the frontend's shared Profile type.
     */
    protected $appends = ['shortBio', 'avatarUrl', 'resumeUrl', 'yearsExperience'];

    protected $hidden = [
        'short_bio', 'avatar_url', 'resume_url', 'years_experience',
        'created_at', 'updated_at',
    ];

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected function casts(): array
    {
        return [
            'years_experience' => 'integer',
        ];
    }

    public function getShortBioAttribute(): string
    {
        return (string) $this->attributes['short_bio'];
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->attributes['avatar_url'];
    }

    public function getResumeUrlAttribute(): ?string
    {
        return $this->attributes['resume_url'];
    }

    public function getYearsExperienceAttribute(): int
    {
        return (int) $this->attributes['years_experience'];
    }

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d\TH:i:s.v\Z');
    }

    public function socials()
    {
        return $this->hasMany(SocialLink::class)->orderBy('id');
    }
}
