<?php

declare(strict_types=1);

namespace App\Domain\Loans;

use DateTimeImmutable;

final readonly class FlatLoanCalculationResult
{
    /**
     * @param array<int, array{
     *   sequence_no: int,
     *   due_date: string,
     *   principal_due: int,
     *   interest_due: int,
     *   total_due: int
     * }> $schedule
     */
    public function __construct(
        public int $principal,
        public float $annualInterestRate,
        public int $termMonths,
        public int $totalInterest,
        public int $totalPayable,
        public int $monthlyInstallment,
        public array $schedule,
        public float $riskFeePercentage = 0.50,
        public float $mandatorySavingPercentage = 0.50,
        public int $riskFeeAmount = 0,
        public int $mandatorySavingAmount = 0,
        public int $netDisbursementAmount = 0
    ) {}
}

final class FlatLoanCalculator
{
    /**
     * Pure function flat loan calculation per PRD Section 7 & 6B specs.
     */
    public static function calculate(
        int $principal,
        float $annualInterestRate,
        int $termMonths,
        ?string $startDateStr = null,
        float $riskFeePercentage = 0.50,
        float $mandatorySavingPercentage = 0.50
    ): FlatLoanCalculationResult {
        if ($principal <= 0 || $termMonths <= 0) {
            return new FlatLoanCalculationResult(
                $principal, $annualInterestRate, $termMonths, 0, 0, 0, [],
                $riskFeePercentage, $mandatorySavingPercentage, 0, 0, 0
            );
        }

        $rateFraction = $annualInterestRate / 100.0;
        $totalInterest = (int) round(($principal * $rateFraction * $termMonths) / 12.0);
        $totalPayable = $principal + $totalInterest;

        $riskFeeAmount = (int) round(($principal * $riskFeePercentage) / 100.0);
        $mandatorySavingAmount = (int) round(($principal * $mandatorySavingPercentage) / 100.0);
        $netDisbursementAmount = $principal - ($riskFeeAmount + $mandatorySavingAmount);

        $basePrincipal = (int) floor($principal / $termMonths);
        $baseInterest = (int) floor($totalInterest / $termMonths);

        $principalDiff = $principal - ($basePrincipal * $termMonths);
        $interestDiff = $totalInterest - ($baseInterest * $termMonths);

        $startDate = new DateTimeImmutable($startDateStr ?? date('Y-m-d'));
        $schedule = [];

        for ($i = 1; $i <= $termMonths; $i++) {
            $dueDate = $startDate->modify("+{$i} month");
            $isLast = ($i === $termMonths);

            $principalDue = $isLast ? $basePrincipal + $principalDiff : $basePrincipal;
            $interestDue = $isLast ? $baseInterest + $interestDiff : $baseInterest;
            $totalDue = $principalDue + $interestDue;

            $schedule[] = [
                'sequence_no' => $i,
                'due_date' => $dueDate->format('Y-m-d'),
                'principal_due' => $principalDue,
                'interest_due' => $interestDue,
                'total_due' => $totalDue,
            ];
        }

        $monthlyInstallment = count($schedule) > 0 ? $schedule[0]['total_due'] : 0;

        return new FlatLoanCalculationResult(
            principal: $principal,
            annualInterestRate: $annualInterestRate,
            termMonths: $termMonths,
            totalInterest: $totalInterest,
            totalPayable: $totalPayable,
            monthlyInstallment: $monthlyInstallment,
            schedule: $schedule,
            riskFeePercentage: $riskFeePercentage,
            mandatorySavingPercentage: $mandatorySavingPercentage,
            riskFeeAmount: $riskFeeAmount,
            mandatorySavingAmount: $mandatorySavingAmount,
            netDisbursementAmount: $netDisbursementAmount
        );
    }
}
