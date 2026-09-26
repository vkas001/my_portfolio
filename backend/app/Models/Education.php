<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'educations';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'institution', 'degree', 'start_date', 'end_date', 'description', 'order',
    ];

    /** camelCase API attributes matching the shared Education type. */
    protected $appends = ['startDate', 'endDate'];

    protected $hidden = ['start_date', 'end_date', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
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

    /**
     * ISO date strings on the wire (end_date: null = in progress), matching
     * the shared Education type.
     */
    public function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }
}
