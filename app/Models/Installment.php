<?php

namespace App\Models;

use App\Enums\InstallmentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Installment extends Model
{
    use HasUuids;

    protected $fillable = [
        'loan_id',
        'sequence_no',
        'due_date',
        'principal_due',
        'interest_due',
        'late_fee_due',
        'total_due',
        'paid_amount',
        'remaining_amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'status' => InstallmentStatus::class,
        'sequence_no' => 'integer',
        'principal_due' => 'integer',
        'interest_due' => 'integer',
        'late_fee_due' => 'integer',
        'total_due' => 'integer',
        'paid_amount' => 'integer',
        'remaining_amount' => 'integer',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class, 'loan_id');
    }
}
