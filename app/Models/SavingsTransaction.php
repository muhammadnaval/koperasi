<?php

namespace App\Models;

use App\Enums\SavingsTransactionType;
use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingsTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'reference_no',
        'member_id',
        'savings_product_id',
        'type',
        'amount',
        'transaction_date',
        'payment_method',
        'description',
        'status',
        'created_by',
        'posted_by',
        'posted_at',
        'voided_by',
        'voided_at',
        'void_reason',
    ];

    protected $casts = [
        'type' => SavingsTransactionType::class,
        'status' => TransactionStatus::class,
        'amount' => 'integer',
        'transaction_date' => 'date',
        'posted_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function savingsProduct(): BelongsTo
    {
        return $this->belongsTo(SavingsProduct::class, 'savings_product_id');
    }
}
