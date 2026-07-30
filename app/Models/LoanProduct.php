<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LoanProduct extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'min_amount',
        'max_amount',
        'min_term_months',
        'max_term_months',
        'interest_method',
        'annual_interest_rate',
        'late_fee_percentage',
        'risk_fee_percentage',
        'mandatory_saving_percentage',
        'grace_period_days',
        'late_fee_type',
        'early_payoff_discount_amount',
        'is_active',
        'description',
    ];

    protected $casts = [
        'min_amount' => 'integer',
        'max_amount' => 'integer',
        'min_term_months' => 'integer',
        'max_term_months' => 'integer',
        'annual_interest_rate' => 'float',
        'late_fee_percentage' => 'float',
        'risk_fee_percentage' => 'float',
        'mandatory_saving_percentage' => 'float',
        'grace_period_days' => 'integer',
        'early_payoff_discount_amount' => 'integer',
        'is_active' => 'boolean',
    ];
}
