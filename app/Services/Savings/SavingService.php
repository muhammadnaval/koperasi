<?php

declare(strict_types=1);

namespace App\Services\Savings;

use App\Enums\SavingsTransactionType;
use App\Enums\TransactionStatus;
use App\Models\AuditLog;
use App\Models\Member;
use App\Models\SavingsProduct;
use App\Models\SavingsTransaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SavingService
{
    /**
     * Post a savings transaction (deposit or withdrawal) with DB transaction & row locking.
     */
    public function postTransaction(array $params, string $actorName = 'Staff'): SavingsTransaction
    {
        return DB::transaction(function () use ($params, $actorName) {
            /** @var Member $member */
            $member = Member::where('id', $params['member_id'])->lockForUpdate()->firstOrFail();
            /** @var SavingsProduct $product */
            $product = SavingsProduct::where('id', $params['savings_product_id'])->firstOrFail();

            $amount = (int) $params['amount'];
            if ($amount <= 0) {
                throw new InvalidArgumentException('Nominal transaksi harus lebih besar dari 0.');
            }

            $type = $params['type'] instanceof SavingsTransactionType ? $params['type'] : SavingsTransactionType::from($params['type']);

            // Validate voluntary withdrawal minimum balance
            if ($type === SavingsTransactionType::WITHDRAWAL) {
                $currentVoluntary = $member->savings_sukarela;
                if (($currentVoluntary - $amount) < $product->minimum_balance) {
                    throw new InvalidArgumentException("Penarikan gagal. Saldo minimal simpanan sukarela sebesar Rp {$product->minimum_balance} harus disisakan.");
                }
            }

            $nextCount = SavingsTransaction::count() + 1;
            $referenceNo = sprintf('SIM-%s-%06d', date('Ym'), $nextCount);

            $tx = SavingsTransaction::create([
                'reference_no' => $referenceNo,
                'member_id' => $member->id,
                'savings_product_id' => $product->id,
                'type' => $type,
                'amount' => $amount,
                'transaction_date' => $params['transaction_date'] ?? date('Y-m-d'),
                'payment_method' => $params['payment_method'] ?? 'kas_tunai',
                'description' => $params['description'] ?? 'Setoran Simpanan',
                'status' => TransactionStatus::POSTED,
                'created_by' => $actorName,
                'posted_by' => $actorName,
                'posted_at' => now(),
            ]);

            // Update member balance
            $change = ($type === SavingsTransactionType::DEPOSIT) ? $amount : -$amount;
            if ($product->type->value === 'principal') {
                $member->savings_pokok += $change;
            }
            if ($product->type->value === 'mandatory') {
                $member->savings_wajib += $change;
            }
            if ($product->type->value === 'voluntary') {
                $member->savings_sukarela += $change;
            }
            $member->total_savings = $member->savings_pokok + $member->savings_wajib + $member->savings_sukarela;
            $member->save();

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'staff',
                'action' => 'POST_SAVINGS_TRANSACTION',
                'entity_type' => 'SavingsTransaction',
                'entity_id' => $tx->reference_no,
                'after' => $tx->toArray(),
            ]);

            return $tx;
        });
    }

    /**
     * Void / reverse a posted savings transaction.
     */
    public function voidTransaction(string $transactionId, string $reason, string $actorName = 'Admin'): SavingsTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason, $actorName) {
            /** @var SavingsTransaction $tx */
            $tx = SavingsTransaction::where('id', $transactionId)->lockForUpdate()->firstOrFail();
            if ($tx->status === TransactionStatus::VOID) {
                throw new InvalidArgumentException('Transaksi sudah dalam status void.');
            }

            /** @var Member $member */
            $member = Member::where('id', $tx->member_id)->lockForUpdate()->firstOrFail();
            $product = $tx->savingsProduct;

            $tx->update([
                'status' => TransactionStatus::VOID,
                'voided_by' => $actorName,
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            // Reverse balance
            $reverseChange = ($tx->type === SavingsTransactionType::DEPOSIT) ? -$tx->amount : $tx->amount;
            if ($product->type->value === 'principal') {
                $member->savings_pokok += $reverseChange;
            }
            if ($product->type->value === 'mandatory') {
                $member->savings_wajib += $reverseChange;
            }
            if ($product->type->value === 'voluntary') {
                $member->savings_sukarela += $reverseChange;
            }
            $member->total_savings = $member->savings_pokok + $member->savings_wajib + $member->savings_sukarela;
            $member->save();

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'admin',
                'action' => 'VOID_SAVINGS_TRANSACTION',
                'entity_type' => 'SavingsTransaction',
                'entity_id' => $tx->reference_no,
                'after' => ['status' => 'void', 'reason' => $reason],
            ]);

            return $tx;
        });
    }
}
