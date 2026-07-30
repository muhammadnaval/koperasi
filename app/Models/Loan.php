<?php

namespace App\Models;

use App\Enums\LoanStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasUuids;

    protected $fillable = [
        'loan_no',
        'loan_application_id',
        'member_id',
        'loan_product_id',
        'principal_amount',
        'term_months',
        'annual_interest_rate',
        'risk_fee_percentage',
        'mandatory_saving_percentage',
        'risk_fee_amount',
        'mandatory_saving_amount',
        'net_disbursement_amount',
        'interest_method',
        'total_interest',
        'total_payable',
        'outstanding_amount',
        'disbursement_date',
        'first_due_date',
        'status',
    ];

    protected $casts = [
        'status' => LoanStatus::class,
        'principal_amount' => 'integer',
        'term_months' => 'integer',
        'annual_interest_rate' => 'float',
        'risk_fee_percentage' => 'float',
        'mandatory_saving_percentage' => 'float',
        'risk_fee_amount' => 'integer',
        'mandatory_saving_amount' => 'integer',
        'net_disbursement_amount' => 'integer',
        'total_interest' => 'integer',
        'total_payable' => 'integer',
        'outstanding_amount' => 'integer',
        'disbursement_date' => 'date',
        'first_due_date' => 'date',
    ];

    public function loanProduct(): BelongsTo
    {
        return $this->belongsTo(LoanProduct::class, 'loan_product_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function loanApplication(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class, 'loan_id')->orderBy('sequence_no');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'loan_id');
    }
}
