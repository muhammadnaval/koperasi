<?php

declare(strict_types=1);

namespace App\Domain\Loans;

final readonly class PaymentAllocationItem
{
    public function __construct(
        public string $installmentId,
        public int $sequenceNo,
        public int $principalAmount,
        public int $interestAmount,
        public int $lateFeeAmount,
        public int $totalAllocated
    ) {}
}

final readonly class PaymentAllocationResult
{
    /**
     * @param  PaymentAllocationItem[]  $allocations
     * @param array<int, array{
     *   id: string,
     *   sequence_no: int,
     *   total_due: int,
     *   paid_amount: int,
     *   remaining_amount: int,
     *   status: string
     * }> $updatedInstallments
     */
    public function __construct(
        public array $allocations,
        public int $remainingPayment,
        public array $updatedInstallments
    ) {}
}

final class OldestDuePaymentAllocator
{
    /**
     * Allocates payment across installments in chronological order (oldest-due-first).
     * Priority per installment: Late Fee -> Interest -> Principal.
     *
     * @param array<int, array{
     *   id: string,
     *   sequence_no: int,
     *   due_date: string,
     *   principal_due: int,
     *   interest_due: int,
     *   late_fee_due: int,
     *   total_due: int,
     *   paid_amount: int,
     *   remaining_amount: int,
     *   status: string
     * }> $installments
     */
    public static function allocate(array $installments, int $paymentAmount): PaymentAllocationResult
    {
        $paymentLeft = $paymentAmount;
        $allocations = [];
        $updatedInstallments = $installments;

        // Sort chronological sequence
        usort($updatedInstallments, fn ($a, $b) => $a['sequence_no'] <=> $b['sequence_no']);

        foreach ($updatedInstallments as &$inst) {
            if ($paymentLeft <= 0) {
                break;
            }
            if ($inst['remaining_amount'] <= 0) {
                continue;
            }

            $unpaidLateFee = max(0, $inst['late_fee_due']);
            $unpaidInterest = max(0, $inst['interest_due']);
            $unpaidPrincipal = max(0, $inst['remaining_amount'] - $unpaidInterest - $unpaidLateFee);

            $lateFeeAlloc = 0;
            $interestAlloc = 0;
            $principalAlloc = 0;

            // 1. Late fee
            if ($unpaidLateFee > 0 && $paymentLeft > 0) {
                $lateFeeAlloc = min($paymentLeft, $unpaidLateFee);
                $paymentLeft -= $lateFeeAlloc;
            }

            // 2. Interest
            if ($unpaidInterest > 0 && $paymentLeft > 0) {
                $interestAlloc = min($paymentLeft, $unpaidInterest);
                $paymentLeft -= $interestAlloc;
            }

            // 3. Principal
            if ($unpaidPrincipal > 0 && $paymentLeft > 0) {
                $principalAlloc = min($paymentLeft, $unpaidPrincipal);
                $paymentLeft -= $principalAlloc;
            }

            $totalAllocated = $lateFeeAlloc + $interestAlloc + $principalAlloc;

            if ($totalAllocated > 0) {
                $allocations[] = new PaymentAllocationItem(
                    installmentId: $inst['id'],
                    sequenceNo: $inst['sequence_no'],
                    principalAmount: $principalAlloc,
                    interestAmount: $interestAlloc,
                    lateFeeAmount: $lateFeeAlloc,
                    totalAllocated: $totalAllocated
                );

                $inst['paid_amount'] += $totalAllocated;
                $inst['remaining_amount'] = max(0, $inst['total_due'] - $inst['paid_amount']);
                $inst['status'] = ($inst['remaining_amount'] === 0) ? 'paid' : 'partial';
            }
        }

        return new PaymentAllocationResult(
            allocations: $allocations,
            remainingPayment: $paymentLeft,
            updatedInstallments: $updatedInstallments
        );
    }
}
