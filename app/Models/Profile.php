<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Profile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'address',
        'role',
        'status',
    ];

    protected $casts = [
        'role' => UserRole::class,
        'status' => UserStatus::class,
    ];

    public function member(): HasOne
    {
        return $this->hasOne(Member::class, 'profile_id');
    }
}
