<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

class EarlyPayoffDiscountTest extends TestCase
{
    public function test_full_flat_rupiah_interest_discount_waives_all_unearned_interest(): void
    {
        $remainingPrincipal = 5000000;
        $unearnedInterest = 800000;
        $lateFee = 15000;

        $discountAmount = 800000; // Rp 800.000 (Full Waived)
        $waivedInterest = min($unearnedInterest, max(0, $discountAmount));
        $retainedInterest = $unearnedInterest - $waivedInterest;
        $totalPayoff = $remainingPrincipal + $lateFee + $retainedInterest;

        $this->assertEquals(800000, $waivedInterest);
        $this->assertEquals(0, $retainedInterest);
        $this->assertEquals(5015000, $totalPayoff);
    }

    public function test_partial_flat_rupiah_interest_discount(): void
    {
        $remainingPrincipal = 5000000;
        $unearnedInterest = 800000;
        $lateFee = 0;

        $discountAmount = 500000; // Rp 500.000 waived
        $waivedInterest = min($unearnedInterest, max(0, $discountAmount));
        $retainedInterest = $unearnedInterest - $waivedInterest;
        $totalPayoff = $remainingPrincipal + $lateFee + $retainedInterest;

        $this->assertEquals(500000, $waivedInterest);
        $this->assertEquals(300000, $retainedInterest);
        $this->assertEquals(5300000, $totalPayoff);
    }

    public function test_zero_flat_rupiah_interest_discount_waives_no_interest(): void
    {
        $remainingPrincipal = 5000000;
        $unearnedInterest = 800000;
        $lateFee = 0;

        $discountAmount = 0; // Rp 0 waived
        $waivedInterest = min($unearnedInterest, max(0, $discountAmount));
        $retainedInterest = $unearnedInterest - $waivedInterest;
        $totalPayoff = $remainingPrincipal + $lateFee + $retainedInterest;

        $this->assertEquals(0, $waivedInterest);
        $this->assertEquals(800000, $retainedInterest);
        $this->assertEquals(5800000, $totalPayoff);
    }
}
