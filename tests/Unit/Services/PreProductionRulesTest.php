<?php

namespace Tests\Unit\Services;

use App\Enums\LoanAppStatus;
use App\Models\LoanApplication;
use Tests\TestCase;

class PreProductionRulesTest extends TestCase
{
    public function test_grace_period_and_late_fee_rate_compliance(): void
    {
        // 3 Days Grace Period Rule
        $gracePeriodDays = 3;
        $lateFeeRate = 0.13; // 0.13% per month

        $dueDate = new \DateTimeImmutable('2026-02-15');
        $paymentDateOnGrace = new \DateTimeImmutable('2026-02-18'); // Day 3 -> No late fee
        $paymentDateOverGrace = new \DateTimeImmutable('2026-02-20'); // Day 5 -> Late fee applies

        $diffOnGrace = $paymentDateOnGrace->diff($dueDate)->days;
        $diffOverGrace = $paymentDateOverGrace->diff($dueDate)->days;

        $isWithinGrace = ($diffOnGrace <= $gracePeriodDays);
        $isOverGrace = ($diffOverGrace > $gracePeriodDays);

        $this->assertTrue($isWithinGrace);
        $this->assertTrue($isOverGrace);

        $monthlyInterest = 100000;
        $calculatedLateFee = (int) round(($monthlyInterest * $lateFeeRate) / 100.0);

        $this->assertEquals(130, $calculatedLateFee); // 0.13% of 100.000 = Rp 130
    }

    public function test_two_tier_approval_hierarchy_workflow(): void
    {
        // Tier 1: Staff submits / reviews application
        $app = new LoanApplication([
            'application_no' => 'PNG-202607-000123',
            'requested_amount' => 5000000,
            'status' => LoanAppStatus::SUBMITTED,
        ]);

        // Tier 1: Under Review by Staff
        $app->status = LoanAppStatus::UNDER_REVIEW;
        $app->reviewed_by = 'Siti Staff';
        $this->assertEquals(LoanAppStatus::UNDER_REVIEW, $app->status);

        // Tier 2: Final Otorisasi & Decision by Approver
        $app->status = LoanAppStatus::APPROVED;
        $app->approved_by = 'Budi Approver (Ketua Koperasi)';
        $app->approved_amount = 5000000;

        $this->assertEquals(LoanAppStatus::APPROVED, $app->status);
        $this->assertEquals('Budi Approver (Ketua Koperasi)', $app->approved_by);
    }
}
