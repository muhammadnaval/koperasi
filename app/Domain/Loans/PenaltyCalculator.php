<?php

declare(strict_types=1);

namespace App\Domain\Loans;

use DateTimeInterface;

final readonly class PenaltyResult
{
    public function __construct(
        public int $penaltyAmount,
        public bool $isWithinGracePeriod,
        public int $daysOverdue,
        public int $gracePeriodDays,
        public float $lateFeePercentage,
        public string $calculationType,
        public string $statusMessage
    ) {}
}

final class PenaltyCalculator
{
    /**
     * Calculate penalty fee and evaluate grace period compliance.
     *
     * @param  int  $principalDue  Principal due amount in IDR
     * @param  int  $interestDue  Monthly interest due amount in IDR
     * @param  DateTimeInterface|string  $dueDate  Installment due date
     * @param  DateTimeInterface|string  $paymentDate  Actual payment or calculation date
     * @param  float  $lateFeePercentage  Late fee percentage or flat daily amount
     * @param  int  $gracePeriodDays  Grace period allowed in days (default 3)
     * @param  string  $calculationType  Calculation basis ('percent_of_interest', 'percent_of_installment', 'flat_per_day')
     */
    public static function calculate(
        int $principalDue,
        int $interestDue,
        DateTimeInterface|string $dueDate,
        DateTimeInterface|string $paymentDate,
        float $lateFeePercentage = 0.13,
        int $gracePeriodDays = 3,
        string $calculationType = 'percent_of_interest'
    ): PenaltyResult {
        $due = is_string($dueDate) ? new \DateTimeImmutable($dueDate) : $dueDate;
        $pay = is_string($paymentDate) ? new \DateTimeImmutable($paymentDate) : $paymentDate;

        $dueFormatted = new \DateTimeImmutable($due->format('Y-m-d'));
        $payFormatted = new \DateTimeImmutable($pay->format('Y-m-d'));

        if ($payFormatted <= $dueFormatted) {
            return new PenaltyResult(
                penaltyAmount: 0,
                isWithinGracePeriod: true,
                daysOverdue: 0,
                gracePeriodDays: $gracePeriodDays,
                lateFeePercentage: $lateFeePercentage,
                calculationType: $calculationType,
                statusMessage: 'Pembayaran tepat waktu / sebelum jatuh tempo.'
            );
        }

        $interval = $payFormatted->diff($dueFormatted);
        $daysOverdue = (int) $interval->days;

        if ($daysOverdue <= $gracePeriodDays) {
            return new PenaltyResult(
                penaltyAmount: 0,
                isWithinGracePeriod: true,
                daysOverdue: $daysOverdue,
                gracePeriodDays: $gracePeriodDays,
                lateFeePercentage: $lateFeePercentage,
                calculationType: $calculationType,
                statusMessage: "Terlambat {$daysOverdue} hari, masih dalam masa tenggang ({$gracePeriodDays} hari)."
            );
        }

        $totalInstallment = $principalDue + $interestDue;
        $penaltyAmount = 0;

        switch ($calculationType) {
            case 'percent_of_installment':
                $penaltyAmount = (int) round(($totalInstallment * $lateFeePercentage) / 100.0);
                break;
            case 'flat_per_day':
                $overGraceDays = $daysOverdue - $gracePeriodDays;
                $penaltyAmount = (int) round($overGraceDays * $lateFeePercentage);
                break;
            case 'percent_of_interest':
            default:
                $penaltyAmount = (int) round(($interestDue * $lateFeePercentage) / 100.0);
                break;
        }

        return new PenaltyResult(
            penaltyAmount: max(0, $penaltyAmount),
            isWithinGracePeriod: false,
            daysOverdue: $daysOverdue,
            gracePeriodDays: $gracePeriodDays,
            lateFeePercentage: $lateFeePercentage,
            calculationType: $calculationType,
            statusMessage: 'Melewati masa tenggang. Denda keterlambatan sebesar Rp '.number_format($penaltyAmount, 0, ',', '.')
        );
    }
}
