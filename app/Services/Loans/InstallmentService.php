<?php

declare(strict_types=1);

namespace App\Services\Loans;

use App\Domain\Loans\OldestDuePaymentAllocator;
use App\Enums\InstallmentStatus;
use App\Enums\LoanStatus;
use App\Enums\TransactionStatus;
use App\Models\AuditLog;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InstallmentService
{
    /**
     * Post an installment payment with Oldest-Due-First allocation.
     */
    public function postPayment(array $params, string $actorName = 'Staff'): Payment
    {
        return DB::transaction(function () use ($params, $actorName) {
            /** @var Loan $loan */
            $loan = Loan::where('id', $params['loan_id'])->lockForUpdate()->firstOrFail();
            $amount = (int) $params['amount'];

            if ($amount <= 0) {
                throw new InvalidArgumentException('Nominal pembayaran harus lebih besar dari Rp 0.');
            }

            $installments = $loan->installments()->lockForUpdate()->get()->toArray();
            $allocResult = OldestDuePaymentAllocator::allocate($installments, $amount);

            if (empty($allocResult->allocations)) {
                throw new InvalidArgumentException('Tidak ada tagihan angsuran yang dapat dialokasikan.');
            }

            $nextCount = Payment::count() + 1;
            $paymentNo = sprintf('BYR-%s-%06d', date('Ym'), $nextCount);
            $allocatedAmount = $amount - $allocResult->remainingPayment;

            $payment = Payment::create([
                'payment_no' => $paymentNo,
                'loan_id' => $loan->id,
                'member_id' => $loan->member_id,
                'payment_date' => $params['payment_date'] ?? date('Y-m-d'),
                'amount' => $allocatedAmount,
                'method' => $params['method'] ?? 'kas_tunai',
                'reference' => $params['reference'] ?? null,
                'notes' => $params['notes'] ?? 'Pembayaran Angsuran',
                'status' => TransactionStatus::POSTED,
                'received_by' => $actorName,
                'posted_at' => now(),
            ]);

            foreach ($allocResult->allocations as $alloc) {
                PaymentAllocation::create([
                    'payment_id' => $payment->id,
                    'installment_id' => $alloc->installmentId,
                    'sequence_no' => $alloc->sequenceNo,
                    'principal_amount' => $alloc->principalAmount,
                    'interest_amount' => $alloc->interestAmount,
                    'late_fee_amount' => $alloc->lateFeeAmount,
                    'total_allocated' => $alloc->totalAllocated,
                ]);

                /** @var Installment $instModel */
                $instModel = Installment::where('id', $alloc->installmentId)->firstOrFail();
                $newPaid = $instModel->paid_amount + $alloc->totalAllocated;
                $newRemaining = max(0, $instModel->total_due - $newPaid);
                $newStatus = ($newRemaining === 0) ? InstallmentStatus::PAID : InstallmentStatus::PARTIAL;

                $instModel->update([
                    'paid_amount' => $newPaid,
                    'remaining_amount' => $newRemaining,
                    'status' => $newStatus,
                    'paid_at' => ($newStatus === InstallmentStatus::PAID) ? now() : null,
                ]);
            }

            // Update loan outstanding
            $totalPaidLoan = $loan->installments()->sum('paid_amount');
            $newOutstanding = max(0, $loan->total_payable - $totalPaidLoan);
            $isPaidOff = ($newOutstanding === 0);

            $loan->update([
                'outstanding_amount' => $newOutstanding,
                'status' => $isPaidOff ? LoanStatus::PAID_OFF : $loan->status,
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'staff',
                'action' => 'POST_PAYMENT',
                'entity_type' => 'Payment',
                'entity_id' => $payment->payment_no,
                'after' => $payment->toArray(),
            ]);

            return $payment;
        });
    }

    /**
     * Void an installment payment & revert allocations.
     */
    public function voidPayment(string $paymentId, string $reason, string $actorName = 'Admin'): Payment
    {
        return DB::transaction(function () use ($paymentId, $reason, $actorName) {
            /** @var Payment $payment */
            $payment = Payment::where('id', $paymentId)->lockForUpdate()->firstOrFail();
            if ($payment->status === TransactionStatus::VOID) {
                throw new InvalidArgumentException('Pembayaran sudah dalam status void.');
            }

            /** @var Loan $loan */
            $loan = Loan::where('id', $payment->loan_id)->lockForUpdate()->firstOrFail();

            $payment->update([
                'status' => TransactionStatus::VOID,
                'voided_by' => $actorName,
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            // Revert allocations
            foreach ($payment->allocations as $alloc) {
                /** @var Installment $inst */
                $inst = Installment::where('id', $alloc->installment_id)->firstOrFail();
                $newPaid = max(0, $inst->paid_amount - $alloc->total_allocated);
                $newRemaining = $inst->total_due - $newPaid;
                $newStatus = ($newPaid === 0) ? InstallmentStatus::UNPAID : InstallmentStatus::PARTIAL;

                $inst->update([
                    'paid_amount' => $newPaid,
                    'remaining_amount' => $newRemaining,
                    'status' => $newStatus,
                    'paid_at' => null,
                ]);
            }

            $totalPaidLoan = $loan->installments()->sum('paid_amount');
            $loan->update([
                'outstanding_amount' => $loan->total_payable - $totalPaidLoan,
                'status' => LoanStatus::ACTIVE,
            ]);

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'admin',
                'action' => 'VOID_PAYMENT',
                'entity_type' => 'Payment',
                'entity_id' => $payment->payment_no,
                'after' => ['status' => 'void', 'reason' => $reason],
            ]);

            return $payment;
        });
    }
}
