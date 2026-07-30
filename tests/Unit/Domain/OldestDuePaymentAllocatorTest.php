<?php

declare(strict_types=1);

namespace Tests\Unit\Domain;

use App\Domain\Loans\OldestDuePaymentAllocator;
use PHPUnit\Framework\TestCase;

class OldestDuePaymentAllocatorTest extends TestCase
{
    public function test_oldest_due_payment_allocator_full_single_installment(): void
    {
        $installments = [
            [
                'id' => 'inst-1',
                'sequence_no' => 1,
                'due_date' => '2026-02-15',
                'principal_due' => 1000000,
                'interest_due' => 100000,
                'late_fee_due' => 0,
                'total_due' => 1100000,
                'paid_amount' => 0,
                'remaining_amount' => 1100000,
                'status' => 'unpaid',
            ],
            [
                'id' => 'inst-2',
                'sequence_no' => 2,
                'due_date' => '2026-03-15',
                'principal_due' => 1000000,
                'interest_due' => 100000,
                'late_fee_due' => 0,
                'total_due' => 1100000,
                'paid_amount' => 0,
                'remaining_amount' => 1100000,
                'status' => 'unpaid',
            ],
        ];

        $res = OldestDuePaymentAllocator::allocate($installments, 1100000);

        $this->assertCount(1, $res->allocations);
        $this->assertEquals('inst-1', $res->allocations[0]->installmentId);
        $this->assertEquals(1000000, $res->allocations[0]->principalAmount);
        $this->assertEquals(100000, $res->allocations[0]->interestAmount);
        $this->assertEquals(0, $res->remainingPayment);
        $this->assertEquals('paid', $res->updatedInstallments[0]['status']);
    }

    public function test_oldest_due_payment_allocator_spillover_multiple_installments(): void
    {
        $installments = [
            [
                'id' => 'inst-1',
                'sequence_no' => 1,
                'due_date' => '2026-02-15',
                'principal_due' => 1000000,
                'interest_due' => 100000,
                'late_fee_due' => 0,
                'total_due' => 1100000,
                'paid_amount' => 0,
                'remaining_amount' => 1100000,
                'status' => 'unpaid',
            ],
            [
                'id' => 'inst-2',
                'sequence_no' => 2,
                'due_date' => '2026-03-15',
                'principal_due' => 1000000,
                'interest_due' => 100000,
                'late_fee_due' => 0,
                'total_due' => 1100000,
                'paid_amount' => 0,
                'remaining_amount' => 1100000,
                'status' => 'unpaid',
            ],
        ];

        // Pay 1.500.000 (covers inst-1 full 1.100.000 and 400.000 partial for inst-2)
        $res = OldestDuePaymentAllocator::allocate($installments, 1500000);

        $this->assertCount(2, $res->allocations);
        $this->assertEquals(1100000, $res->allocations[0]->totalAllocated);
        $this->assertEquals(400000, $res->allocations[1]->totalAllocated);
        $this->assertEquals(0, $res->remainingPayment);
        $this->assertEquals('paid', $res->updatedInstallments[0]['status']);
        $this->assertEquals('partial', $res->updatedInstallments[1]['status']);
    }
}
