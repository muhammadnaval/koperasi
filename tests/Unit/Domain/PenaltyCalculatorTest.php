<?php

namespace Tests\Unit\Domain;

use App\Domain\Loans\PenaltyCalculator;
use Tests\TestCase;

class PenaltyCalculatorTest extends TestCase
{
    public function test_payment_on_or_before_due_date_has_no_penalty(): void
    {
        $res = PenaltyCalculator::calculate(
            principalDue: 1000000,
            interestDue: 100000,
            dueDate: '2026-02-15',
            paymentDate: '2026-02-15',
            lateFeePercentage: 0.13,
            gracePeriodDays: 3,
            calculationType: 'percent_of_interest'
        );

        $this->assertEquals(0, $res->penaltyAmount);
        $this->assertTrue($res->isWithinGracePeriod);
        $this->assertEquals(0, $res->daysOverdue);
    }

    public function test_payment_within_grace_period_has_no_penalty(): void
    {
        // 3 days grace period: 2026-02-18 is day 3
        $res = PenaltyCalculator::calculate(
            principalDue: 1000000,
            interestDue: 100000,
            dueDate: '2026-02-15',
            paymentDate: '2026-02-18',
            lateFeePercentage: 0.13,
            gracePeriodDays: 3,
            calculationType: 'percent_of_interest'
        );

        $this->assertEquals(0, $res->penaltyAmount);
        $this->assertTrue($res->isWithinGracePeriod);
        $this->assertEquals(3, $res->daysOverdue);
    }

    public function test_payment_beyond_grace_period_calculates_penalty_on_interest(): void
    {
        // 5 days overdue > 3 days grace period
        $res = PenaltyCalculator::calculate(
            principalDue: 1000000,
            interestDue: 100000,
            dueDate: '2026-02-15',
            paymentDate: '2026-02-20',
            lateFeePercentage: 0.13,
            gracePeriodDays: 3,
            calculationType: 'percent_of_interest'
        );

        $this->assertFalse($res->isWithinGracePeriod);
        $this->assertEquals(5, $res->daysOverdue);
        $this->assertEquals(130, $res->penaltyAmount); // 0.13% of 100,000 = Rp 130
    }

    public function test_payment_beyond_grace_period_calculates_penalty_on_total_installment(): void
    {
        $res = PenaltyCalculator::calculate(
            principalDue: 1000000,
            interestDue: 100000,
            dueDate: '2026-02-15',
            paymentDate: '2026-02-20',
            lateFeePercentage: 1.0,
            gracePeriodDays: 3,
            calculationType: 'percent_of_installment'
        );

        $this->assertFalse($res->isWithinGracePeriod);
        // Total installment = 1,100,000; 1% = 11,000
        $this->assertEquals(11000, $res->penaltyAmount);
    }

    public function test_payment_beyond_grace_period_flat_per_day(): void
    {
        // 5 days overdue - 3 days grace = 2 days over grace
        $res = PenaltyCalculator::calculate(
            principalDue: 1000000,
            interestDue: 100000,
            dueDate: '2026-02-15',
            paymentDate: '2026-02-20',
            lateFeePercentage: 5000, // Rp 5,000 / day
            gracePeriodDays: 3,
            calculationType: 'flat_per_day'
        );

        $this->assertFalse($res->isWithinGracePeriod);
        $this->assertEquals(10000, $res->penaltyAmount); // 2 days * 5,000 = 10,000
    }
}
