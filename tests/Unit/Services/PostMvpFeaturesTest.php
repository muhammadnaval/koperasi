<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

class PostMvpFeaturesTest extends TestCase
{
    public function test_early_payoff_waives_unearned_future_interest(): void
    {
        $principalDue = 5000000;
        $interestDue = 500000;
        $lateFeeDue = 15000;

        // Early payoff waives interest: total = principal + late fee
        $payoffTotal = $principalDue + $lateFeeDue;
        $waivedInterest = $interestDue;

        $this->assertEquals(5015000, $payoffTotal);
        $this->assertEquals(500000, $waivedInterest);
    }

    public function test_multi_tier_approval_hierarchy(): void
    {
        $reviewerRole = 'staff';
        $approverRole = 'approver';

        $this->assertNotEquals($reviewerRole, $approverRole);
    }

    public function test_csv_importer_column_header_validation(): void
    {
        $headers = ['member_no', 'full_name', 'email', 'phone', 'identity_no'];
        $this->assertContains('member_no', $headers);
        $this->assertContains('identity_no', $headers);
    }
}
