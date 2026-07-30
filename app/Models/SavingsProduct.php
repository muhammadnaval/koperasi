<?php

namespace App\Models;

use App\Enums\SavingsType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SavingsProduct extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'type',
        'default_amount',
        'minimum_balance',
        'is_active',
        'description',
    ];

    protected $casts = [
        'type' => SavingsType::class,
        'default_amount' => 'integer',
        'minimum_balance' => 'integer',
        'is_active' => 'boolean',
    ];
}
