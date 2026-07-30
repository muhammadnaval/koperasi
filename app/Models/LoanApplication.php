<?php

namespace App\Models;

use App\Enums\LoanAppStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LoanApplication extends Model
{
    use HasUuids;

    protected $fillable = [
        'application_no',
        'member_id',
        'loan_product_id',
        'requested_amount',
        'requested_term_months',
        'purpose',
        'status',
        'approved_amount',
        'approved_term_months',
        'approved_annual_rate',
        'review_notes',
        'decision_reason',
        'reviewed_by',
        'approved_by',
        'submitted_at',
        'decided_at',
        'disbursed_at',
        'attachments',
    ];

    protected $casts = [
        'status' => LoanAppStatus::class,
        'requested_amount' => 'integer',
        'requested_term_months' => 'integer',
        'approved_amount' => 'integer',
        'approved_term_months' => 'integer',
        'approved_annual_rate' => 'float',
        'attachments' => 'array',
        'submitted_at' => 'datetime',
        'decided_at' => 'datetime',
        'disbursed_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function loanProduct(): BelongsTo
    {
        return $this->belongsTo(LoanProduct::class, 'loan_product_id');
    }

    public function loan(): HasOne
    {
        return $this->hasOne(Loan::class, 'loan_application_id');
    }
}
