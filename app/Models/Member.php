<?php

namespace App\Models;

use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasUuids;

    protected $fillable = [
        'member_no',
        'profile_id',
        'full_name',
        'email',
        'phone',
        'identity_no',
        'birth_date',
        'join_date',
        'occupation',
        'address',
        'status',
        'savings_pokok',
        'savings_wajib',
        'savings_sukarela',
        'total_savings',
    ];

    protected $casts = [
        'status' => MemberStatus::class,
        'savings_pokok' => 'integer',
        'savings_wajib' => 'integer',
        'savings_sukarela' => 'integer',
        'total_savings' => 'integer',
        'birth_date' => 'date',
        'join_date' => 'date',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'profile_id');
    }

    public function savingsTransactions(): HasMany
    {
        return $this->hasMany(SavingsTransaction::class, 'member_id');
    }

    public function loanApplications(): HasMany
    {
        return $this->hasMany(LoanApplication::class, 'member_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'member_id');
    }
}
