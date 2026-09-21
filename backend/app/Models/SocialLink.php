<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialLink extends Model
{
    protected $hidden = ['profile_id', 'created_at', 'updated_at'];

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = ['id', 'profile_id', 'label', 'url', 'icon'];
}
