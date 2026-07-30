<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAllocation extends Model
{
    use HasUuids;

    protected $fillable = [
        'payment_id',
        'installment_id',
        'sequence_no',
        'principal_amount',
        'interest_amount',
        'late_fee_amount',
        'total_allocated',
    ];

    protected $casts = [
        'sequence_no' => 'integer',
        'principal_amount' => 'integer',
        'interest_amount' => 'integer',
        'late_fee_amount' => 'integer',
        'total_allocated' => 'integer',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class, 'installment_id');
    }
}
