<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $table = 'experience';

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'company', 'role', 'start_date', 'end_date', 'location',
        'employment_type', 'highlights', 'tech_stack', 'order',
    ];

    /** camelCase API attributes matching the shared Experience type. */
    protected $appends = ['startDate', 'endDate', 'employmentType', 'techStack'];

    protected $hidden = ['start_date', 'end_date', 'employment_type', 'tech_stack', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'highlights' => 'array',
            'tech_stack' => 'array',
            'order' => 'integer',
        ];
    }

    public function getStartDateAttribute(): string
    {
        return date('Y-m-d', strtotime((string) $this->attributes['start_date']));
    }

    public function getEndDateAttribute(): ?string
    {
        return $this->attributes['end_date']
            ? date('Y-m-d', strtotime((string) $this->attributes['end_date']))
            : null;
    }

    public function getEmploymentTypeAttribute(): string
    {
        return (string) $this->attributes['employment_type'];
    }

    public function getTechStackAttribute(): array
    {
        return json_decode((string) $this->attributes['tech_stack'], true) ?: [];
    }

    /**
     * ISO date strings on the wire (end_date: null = current job), matching
     * the Express API.
     */
    public function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }
}
