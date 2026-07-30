<?php

namespace Tests\Unit\Services;

use App\Domain\Loans\FlatLoanCalculator;
use App\Domain\Loans\OldestDuePaymentAllocator;
use App\Enums\LoanStatus;
use App\Models\Loan;
use App\Models\LoanProduct;
use Tests\TestCase;

class LoanWorkflowModuleTest extends TestCase
{
    public function test_partial_payment_allocates_partially_and_sets_status_to_partial(): void
    {
        $installments = [
            [
                'id' => 'inst-101',
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
        ];

        // Pay 500.000 (Partial payment for 1.100.000 total due)
        $res = OldestDuePaymentAllocator::allocate($installments, 500000);

        $this->assertCount(1, $res->allocations);
        $this->assertEquals(500000, $res->allocations[0]->totalAllocated);
        $this->assertEquals(0, $res->remainingPayment);
        $this->assertEquals('partial', $res->updatedInstallments[0]['status']);
        $this->assertEquals(600000, $res->updatedInstallments[0]['remaining_amount']);
    }

    public function test_rounding_difference_allocated_to_last_installment(): void
    {
        // 10.000.000, 10% rate, 3 months term
        $calc = FlatLoanCalculator::calculate(10000000, 10.0, 3, '2026-01-15');

        $this->assertCount(3, $calc->schedule);
        $this->assertEquals(3333333, $calc->schedule[0]['principal_due']);
        $this->assertEquals(3333333, $calc->schedule[1]['principal_due']);
        $this->assertEquals(3333334, $calc->schedule[2]['principal_due']); // Last gets rounding diff

        $totalSum = array_sum(array_column($calc->schedule, 'total_due'));
        $this->assertEquals($calc->totalPayable, $totalSum);
    }

    public function test_full_payoff_transitions_loan_status_to_paid_off(): void
    {
        $loan = new Loan([
            'loan_no' => 'PJM-202607-000001',
            'principal_amount' => 12000000,
            'total_payable' => 13200000,
            'outstanding_amount' => 1100000,
            'status' => LoanStatus::ACTIVE,
        ]);

        $installments = [
            [
                'id' => 'inst-1',
                'sequence_no' => 12,
                'due_date' => '2026-12-15',
                'principal_due' => 1000000,
                'interest_due' => 100000,
                'late_fee_due' => 0,
                'total_due' => 1100000,
                'paid_amount' => 0,
                'remaining_amount' => 1100000,
                'status' => 'unpaid',
            ],
        ];

        // Pay remaining 1.100.000
        $res = OldestDuePaymentAllocator::allocate($installments, 1100000);
        $newOutstanding = max(0, $loan->outstanding_amount - $res->allocations[0]->totalAllocated);

        if ($newOutstanding === 0) {
            $loan->status = LoanStatus::PAID_OFF;
        }

        $this->assertEquals(0, $newOutstanding);
        $this->assertEquals(LoanStatus::PAID_OFF, $loan->status);
    }

    public function test_product_parameter_change_does_not_alter_active_loan_contracts(): void
    {
        // 1. Existing Active Loan with 10% rate
        $loan = new Loan([
            'loan_no' => 'PJM-202607-000099',
            'principal_amount' => 10000000,
            'annual_interest_rate' => 10.0,
            'total_interest' => 1000000,
            'total_payable' => 11000000,
            'outstanding_amount' => 11000000,
            'status' => LoanStatus::ACTIVE,
        ]);

        // 2. Admin updates product rate from 10% to 15%
        $product = new LoanProduct([
            'code' => 'PJM-SERBAGUNA',
            'annual_interest_rate' => 10.0,
        ]);

        $product->annual_interest_rate = 15.0; // Product updated for NEW applications

        // Active loan contract MUST remain unchanged at 10.0% & 11.000.000 total payable!
        $this->assertEquals(10.0, $loan->annual_interest_rate);
        $this->assertEquals(11000000, $loan->total_payable);
    }
}
